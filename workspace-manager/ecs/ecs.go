package ecsmanager

import (
	"context"
	"errors"
	"time"

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
	VscodeTaskDef  string
	JupyterTaskDef string

	SubnetIDs      []string
	SecurityGroups []string
}

func NewECSManager() (*ECSManager, error) {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, err
	}

	return &ECSManager{
		ecsClient:      ecs.NewFromConfig(cfg),
		ec2Client:      ec2.NewFromConfig(cfg),
		Cluster:        "ambilio-cluster",
		VscodeTaskDef:  "vscode_embedded",
		JupyterTaskDef: "jupyter_embedded",
		SubnetIDs: []string{
			"subnet-08a2ed4baa1a627f8",
		},
		SecurityGroups: []string{
			"sg-0fcec6ae1b628b075",
		},
	}, nil
}

func (m *ECSManager) RunWorkspaceTask(
	ctx context.Context,
	userID string,
	instanceID string,
	efsPath string,
	workspaceType string,
) (taskArn string, privateIP string, err error) {

	var taskDef string
	var containerName string

	switch workspaceType {
	case "vscode":
		taskDef = m.VscodeTaskDef
		containerName = "vscode_embed"

	case "jupyter":
		taskDef = m.JupyterTaskDef
		containerName = "jupyter_embed"

	default:
		return "", "", errors.New("invalid workspace type")
	}

	runResp, err := m.ecsClient.RunTask(ctx, &ecs.RunTaskInput{
		Cluster:        aws.String(m.Cluster),
		TaskDefinition: aws.String(taskDef),
		LaunchType:     types.LaunchTypeFargate,
		NetworkConfiguration: &types.NetworkConfiguration{
			AwsvpcConfiguration: &types.AwsVpcConfiguration{
				Subnets:        m.SubnetIDs,
				SecurityGroups: m.SecurityGroups,
				AssignPublicIp: types.AssignPublicIpEnabled,
			},
		},
		Overrides: &types.TaskOverride{
			ContainerOverrides: []types.ContainerOverride{
				{
					Name: aws.String(containerName),
					Environment: []types.KeyValuePair{
						{Name: aws.String("USER_ID"), Value: aws.String(userID)},
						{Name: aws.String("INSTANCE_ID"), Value: aws.String(instanceID)},
						{Name: aws.String("EFS_PATH"), Value: aws.String(efsPath)},
						{Name: aws.String("WORKSPACE_TYPE"), Value: aws.String(workspaceType)},
					},
				},
			},
		},
	})
	if err != nil {
		return "", "", err
	}

	if len(runResp.Tasks) == 0 {
		return "", "", errors.New("no ECS task started")
	}

	taskArn = aws.ToString(runResp.Tasks[0].TaskArn)

	// Wait for ENI
	var eniID string
	for i := 0; i < 10; i++ {
		desc, err := m.ecsClient.DescribeTasks(ctx, &ecs.DescribeTasksInput{
			Cluster: aws.String(m.Cluster),
			Tasks:   []string{taskArn},
		})
		if err != nil {
			return taskArn, "", err
		}

		for _, att := range desc.Tasks[0].Attachments {
			for _, d := range att.Details {
				if aws.ToString(d.Name) == "networkInterfaceId" {
					eniID = aws.ToString(d.Value)
					break
				}
			}
		}

		if eniID != "" {
			break
		}

		time.Sleep(2 * time.Second)
	}

	if eniID == "" {
		return taskArn, "", errors.New("failed to get ENI")
	}

	eniDesc, err := m.ec2Client.DescribeNetworkInterfaces(ctx, &ec2.DescribeNetworkInterfacesInput{
		NetworkInterfaceIds: []string{eniID},
	})
	if err != nil {
		return taskArn, "", err
	}

	privateIP = aws.ToString(eniDesc.NetworkInterfaces[0].PrivateIpAddress)
	return taskArn, privateIP, nil
}

func (m *ECSManager) StopTask(ctx context.Context, taskArn string) error {
	_, err := m.ecsClient.StopTask(ctx, &ecs.StopTaskInput{
		Cluster: aws.String(m.Cluster),
		Task:    aws.String(taskArn),
		Reason:  aws.String("Stopped by user"),
	})
	return err
}
