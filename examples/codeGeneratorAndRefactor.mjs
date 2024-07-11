import OpenAI from 'openai';
import MinimalChainable from '../src/index.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function openAiCallable(model, prompt) {
    const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content;
}

async function promptChainableExample() {
    const model = "gpt-4o";

    try {
        const [result, contextFilledPrompts] = await MinimalChainable.run(
            {},
            model,
            openAiCallable,
            [
                // 1st prompt
                `Generate a basic tic tac toe game in nodejs (CLI). `,

                // 2nd prompt
                `Take the function generated in the previous step and refactor it to apply SOLID principles:
                - Single Responsibility Principle: Ensure the function does only one thing.
                - Open/Closed Principle: Make the function open for extension, closed for modification.
                - Liskov Substitution Principle: Ensure the function can be substituted with a base class or interface.
                - Interface Segregation Principle: Separate the function into smaller interfaces if necessary.
                - Dependency Inversion Principle: Use dependency injection to provide dependencies instead of hard-coding them.
                {{output[-1]}}
                `
            ]
        );

        console.log("\n\n📖 Prompts~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        contextFilledPrompts.forEach((prompt, index) => {
            console.log(`\n🔗 -------- Prompt Chain Result #${index + 1} -------------\n`);
            console.log(prompt);
        });

        console.log("\n\n📊 Results~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        result.forEach((res, index) => {
            console.log(`\n🔗 -------- Prompt Chain Result #${index + 1} -------------\n`);
            console.log(res);
        });

        const chainedPrompts = await MinimalChainable.toDelimTextFile(
            "example_context_filled_prompts",
            contextFilledPrompts
        );
        const chainableResult = await MinimalChainable.toDelimTextFile(
            "example_prompt_results",
            result
        );

        console.log(`\n\n📖 Prompts Saved to File: example_context_filled_prompts.delim`);
        console.log(`📊 Results Saved to File: example_prompt_results.delim`);
    } catch (error) {
        console.error("Error in promptChainableExample:", error);
    }
}

async function main() {
    try {
        await promptChainableExample();
    } catch (error) {
        console.error("Error in main:", error);
    }
}

main();
