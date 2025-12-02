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
		Cluster:        "ambilio-cluster",
		TaskDefinition: "vscode_backend",
		SubnetIDs: []string{
			"subnet-0aa8ba758b03f9112",
		},
		SecurityGroups: []string{
			"sg-0f445e5bb8011cae6", // replace with your security group allowing HTTP/HTTPS
		},
	}, nil
}

// Example: RunWorkspaceTask will assign a public IP in these subnets
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
		LaunchType:     types.LaunchTypeFargate,
		NetworkConfiguration: &types.NetworkConfiguration{
			AwsvpcConfiguration: &types.AwsVpcConfiguration{
				Subnets:        m.SubnetIDs,
				SecurityGroups: m.SecurityGroups,
				AssignPublicIp: types.AssignPublicIpEnabled, // public IP assigned
			},
		},
		Overrides: &types.TaskOverride{
			ContainerOverrides: []types.ContainerOverride{
				{
					Name: aws.String("vscode_backend"),
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
	// Get ENI and private IP
	var eniID string
for i := 0; i < 5; i++ { // try up to 5 times
    taskResp, err := m.ecsClient.DescribeTasks(ctx, &ecs.DescribeTasksInput{
        Cluster: aws.String(m.Cluster),
        Tasks:   []string{taskArn},
    })
    if err != nil {
        return taskArn, "", err
    }

    if len(taskResp.Tasks) > 0 && len(taskResp.Tasks[0].Attachments) > 0 {
        for _, d := range taskResp.Tasks[0].Attachments[0].Details {
            if d.Name != nil && *d.Name == "networkInterfaceId" {
                eniID = aws.ToString(d.Value)
            }
        }
    }

    if eniID != "" {
        break
    }
    time.Sleep(2 * time.Second) // wait before retry
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
		Cluster: aws.String(m.Cluster),
		Task:    aws.String(taskArn),
		Reason:  aws.String("Stopped by user"),
	})
	return err
}
