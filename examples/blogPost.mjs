import OpenAI from 'openai';
import MinimalChainable from '../src/index.js'

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

async function promptChainablePoc() {
    const model = "gpt-4o";

    try {
        const [result, contextFilledPrompts] = await MinimalChainable.run(
            { topic: "AI Agents" },
            model,
            openAiCallable,
            [
                'Generate one blog post title about: {{topic}}. Respond strictly in JSON format: {"title": "<title>"} (avoid using ```json)',
                "Generate one hook for the blog post title: {{output[-1].title}}",
                `Based on the BLOG_TITLE and BLOG_HOOK, generate the first paragraph of the blog post.
BLOG_TITLE:
{{output[-2].title}}
BLOG_HOOK:
{{output[-1]}}`
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
            "poc_context_filled_prompts",
            contextFilledPrompts
        );
        const chainableResult = await MinimalChainable.toDelimTextFile(
            "poc_prompt_results",
            result
        );

        console.log(`\n\n📖 Prompts Saved to File: poc_context_filled_prompts.delim`);
        console.log(`📊 Results Saved to File: poc_prompt_results.delim`);
    } catch (error) {
        console.error("Error in promptChainablePoc:", error);
    }
}

async function main() {
    try {
        await promptChainablePoc();
    } catch (error) {
        console.error("Error in main:", error);
    }
}

main();
