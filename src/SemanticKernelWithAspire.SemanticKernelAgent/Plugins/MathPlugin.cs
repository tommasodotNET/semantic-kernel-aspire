using System;
using System.ComponentModel;
using Microsoft.SemanticKernel;

namespace SemanticKernelWithAspire.SemanticKernelAgent.Plugins;

[Description("Plugin for basic math operations.")]
public class MathPlugin
{
    [KernelFunction("Add")]
    [Description("Adds two numbers.")]
    public static double Add([Description("first number")]double a, [Description("second number")]double b)
    {
        return a + b;
    }

    [KernelFunction("Subtract")]
    [Description("Subtracts two numbers.")]
    public static double Subtract([Description("first number")]double a, [Description("second number")]double b)
    {
        return a - b;
    }

    [KernelFunction("Multiply")]
    [Description("Multiplies two numbers.")]
    public static double Multiply([Description("first number")]double a, [Description("second number")]double b)
    {
        return a * b;
    }

    [KernelFunction("Divide")]
    [Description("Divides two numbers.")]
    public static double Divide([Description("first number")]double a, [Description("second number")]double b)
    {
        if (b == 0)
        {
            throw new DivideByZeroException("Cannot divide by zero.");
        }
        return a / b;
    }
}
