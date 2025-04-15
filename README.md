# Description

This is a demo to showcase how to use the [Semantic Kernel Agent Framework](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/?pivots=programming-language-csharp) with [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview).

## How to run the example

1. Configure the OpenAI integration for .NET Aspire accoring to the [documentation](https://learn.microsoft.com/en-us/dotnet/aspire/azureai/azureai-openai-integration?tabs=dotnet-cli#connect-to-an-existing-azure-openai-service).

Note that you can use either DefaultAzureCredentials or API Keys for authentication.

You need to add the connection string to your AppHost `appsettings.json` file. The connection string format depends on the authentication method you choose.

Using DefaultAzureCredentials:

```json
{
  "ConnectionStrings": {
    "azureOpenAI": "https://{account_name}.openai.azure.com/"
  }
}
```

Using API Keys:

```json
{
  "ConnectionStrings": {
    "azureOpenAI": "Endpoint=https://{account_name}.openai.azure.com/;Key={api_key};"
  },
}
```

2. Run the sample

```bash
cd src/SemanticKernelWithAspire.AppHost
dotnet run
```