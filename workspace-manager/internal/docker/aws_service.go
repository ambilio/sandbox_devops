package docker

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"github.com/aws/aws-sdk-go-v2/service/sts/types"
)

type AWSService struct {
	sts *sts.Client
}

func NewAWSService() (*AWSService, error) {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, err
	}
	return &AWSService{
		sts: sts.NewFromConfig(cfg),
	}, nil
}

func (a *AWSService) AssumeSandboxRole(
	ctx context.Context,
	userID string,
) (*types.Credentials, error) {

	roleArn := "arn:aws:iam::921646896924:role/sandbox-console-role"

	out, err := a.sts.AssumeRole(ctx, &sts.AssumeRoleInput{
		RoleArn:         aws.String(roleArn),
		RoleSessionName: aws.String("sandbox-" + userID),
		DurationSeconds: aws.Int32(3600),
	})
	if err != nil {
		return nil, err
	}

	return out.Credentials, nil
}

func (a *AWSService) GenerateConsoleURL(
	creds *types.Credentials,
) (string, error) {

	session := map[string]string{
		"sessionId":    aws.ToString(creds.AccessKeyId),
		"sessionKey":   aws.ToString(creds.SecretAccessKey),
		"sessionToken": aws.ToString(creds.SessionToken),
	}

	b, _ := json.Marshal(session)

	resp, err := http.Get(
		"https://signin.aws.amazon.com/federation" +
			"?Action=getSigninToken" +
			"&Session=" + url.QueryEscape(string(b)),
	)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var out struct {
		SigninToken string `json:"SigninToken"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", err
	}

	loginURL :=
		"https://signin.aws.amazon.com/federation" +
			"?Action=login" +
			"&Destination=https://console.aws.amazon.com/" +
			"&SigninToken=" + out.SigninToken

	return loginURL, nil
}
