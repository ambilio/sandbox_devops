package docker

import (
	"context"
	"crypto/rand"
	"encoding/base64"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/iam"
)

type AWSService struct {
	iam *iam.Client
}

func NewAWSService() (*AWSService, error) {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, err
	}
	return &AWSService{
		iam: iam.NewFromConfig(cfg),
	}, nil
}


func (a *AWSService) CreateSandboxUser(
	ctx context.Context,
	instanceID string,
) (username, password, consoleURL string, err error) {

	username = "ambilio-" + instanceID

	_, err = a.iam.CreateUser(ctx, &iam.CreateUserInput{
		UserName: aws.String(username),
		PermissionsBoundary: aws.String(
			"arn:aws:iam::921646896924:policy/ambilio-sandbox-boundary",
		),
	})
	if err != nil {
		return
	}

	password = generatePassword()

	_, err = a.iam.CreateLoginProfile(ctx, &iam.CreateLoginProfileInput{
		UserName:              aws.String(username),
		Password:              aws.String(password),
		PasswordResetRequired: false,
	})
	if err != nil {
		return
	}

	consoleURL = "https://921646896924.signin.aws.amazon.com/console"
	return
}




func generatePassword() string {
	b := make([]byte, 24)
	rand.Read(b)
	return base64.RawStdEncoding.EncodeToString(b)
}
