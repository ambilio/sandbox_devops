package ecsmanager

import (
	"context"
	"errors"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	"github.com/aws/aws-sdk-go-v2/service/ecs"
	"github.com/aws/aws-sdk-go-v2/service/ecs/types"
)

type ECSManager struct {
	ecsClient *ecs.Client
	ec2Client *ec2.Client

	Cluster        string
	TaskDefinition string
	SubnetIDs      []string
	SecurityGroups []string
}

func NewECSManager() (*ECSManager, error) {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, err
	}

	return &ECSManager{
		ecsClient: ecs.NewFromConfig(cfg),
		ec2Client: ec2.NewFromConfig(cfg),
	}, nil
}

func (m *ECSManager) RunWorkspaceTask(
	ctx context.Context,
	userID string,
	instanceID string,
	efsPath string,
	typ string,
) (taskArn string, privateIP string, err error) {

	resp, err := m.ecsClient.RunTask(ctx, &ecs.RunTaskInput{
		Cluster:        aws.String(m.Cluster),
		TaskDefinition: aws.String(m.TaskDefinition),

		LaunchType: types.LaunchTypeFargate,

		NetworkConfiguration: &types.NetworkConfiguration{
			AwsvpcConfiguration: &types.AwsVpcConfiguration{
				Subnets:        m.SubnetIDs,
				SecurityGroups: m.SecurityGroups,
				AssignPublicIp: types.AssignPublicIpDisabled,
			},
		},

		Overrides: &types.TaskOverride{
			ContainerOverrides: []types.ContainerOverride{
				{
					Name: aws.String("workspace"),
					Environment: []types.KeyValuePair{
						{Name: aws.String("USER_ID"), Value: aws.String(userID)},
						{Name: aws.String("INSTANCE_ID"), Value: aws.String(instanceID)},
						{Name: aws.String("EFS_PATH"), Value: aws.String(efsPath)},
						{Name: aws.String("WORKSPACE_TYPE"), Value: aws.String(typ)},
					},
				},
			},
		},
	})

	if err != nil {
		return "", "", err
	}

	if len(resp.Tasks) == 0 {
		return "", "", errors.New("no tasks launched")
	}

	taskArn = aws.ToString(resp.Tasks[0].TaskArn)

	if len(resp.Tasks[0].Attachments) == 0 {
		return taskArn, "", errors.New("no network attachment found")
	}

	var eniID string
	for _, d := range resp.Tasks[0].Attachments[0].Details {
		if d.Name != nil && *d.Name == "networkInterfaceId" {
			eniID = aws.ToString(d.Value)
		}
	}

	if eniID == "" {
		return taskArn, "", errors.New("ENI not found in task attachments")
	}

	ec2Resp, err := m.ec2Client.DescribeNetworkInterfaces(ctx, &ec2.DescribeNetworkInterfacesInput{
		NetworkInterfaceIds: []string{eniID},
	})
	if err != nil {
		return taskArn, "", err
	}

	privateIP = aws.ToString(ec2Resp.NetworkInterfaces[0].PrivateIpAddress)

	return taskArn, privateIP, nil
}

func (m *ECSManager) StopTask(ctx context.Context, taskArn string) error {
	_, err := m.ecsClient.StopTask(ctx, &ecs.StopTaskInput{
		Task:    aws.String(taskArn),
		Cluster: aws.String(m.Cluster),
		Reason:  aws.String("Idle timeout"),
	})
	return err
}
