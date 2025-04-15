var builder = DistributedApplication.CreateBuilder(args);

var openai = builder.AddConnectionString("azureOpenAI");

var semanticKernelAgent = builder.AddProject<Projects.SemanticKernelWithAspire_SemanticKernelAgent>("semanticKernelAgent")
    .WithReference(openai);

var frontend = builder.AddNpmApp("frontend", "../frontend", "dev")
    .WithNpmPackageInstallation()
    .WithReference(semanticKernelAgent)
    .WithHttpEndpoint(env: "PORT");

builder.Build().Run();
