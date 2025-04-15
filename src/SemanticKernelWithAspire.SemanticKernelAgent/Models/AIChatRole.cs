// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Text.Json.Serialization;
using SemanticKernelWithAspire.SemanticKernelAgent.Converters;

namespace SemanticKernelWithAspire.SemanticKernelAgent.Models;

[JsonConverter(typeof(JsonCamelCaseEnumConverter<AIChatRole>))]
public enum AIChatRole
{
    System,
    Assistant,
    User
}
