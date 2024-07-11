import fetch from 'node-fetch';
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

async function fetchRedditPosts() {
    const response = await fetch('https://www.reddit.com/r/artificial.json');
    const data = await response.json();

    const filteredPosts = data.data.children
        .map(post => post.data)
        .filter(post => post.selftext)
        .map(post => ({ title: post.title, selftext: post.selftext, url: `https://www.reddit.com${post.permalink}` }));

    return filteredPosts;
}

async function promptChainableExample() {
    const model = "gpt-4o";

    try {
        const redditPosts = await fetchRedditPosts();

        const [result, contextFilledPrompts] = await MinimalChainable.run(
            {
                redditPosts: redditPosts.map(post => `- ${post.title}`).join('\n')
            },
            model,
            openAiCallable,
            [
                `Please select the 5 most interesting posts of this artificial intelligence subreddit to generate a newsletter\nReddit Posts:\n{{redditPosts}}\n Only return the title list (numbered)`,
                `Now, let's generate the body for each selected post to include in the newsletter\n{{output[-1]}}`,
                `Finalize the newsletter by providing a summary of the selected posts the summary has to be less than the length of a tweet, and it has to be in one sentence, and a call to action: CTA should be go to https://girlazo.com. Content to summarize: {{output[-1]}}\n`
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
            "newsletter_context_filled_prompts",
            contextFilledPrompts
        );
        const chainableResult = await MinimalChainable.toDelimTextFile(
            "newsletter_prompt_results",
            result
        );

        console.log(`\n\n📖 Prompts Saved to File: newsletter_context_filled_prompts.delim`);
        console.log(`📊 Results Saved to File: newsletter_prompt_results.delim`);
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
