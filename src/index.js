const fs = require('fs');

class MinimalChainable {
    static async run(context, model, callable, prompts) {
        let output = [];
        let contextFilledPrompts = [];

        for (let i = 0; i < prompts.length; i++) {
            let prompt = prompts[i];

            // Replace context variables in the prompt
            for (const [key, value] of Object.entries(context)) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                prompt = prompt.replace(regex, value);
            }

            // Replace references to previous outputs in the prompt
            for (let j = i; j > 0; j--) {
                const previousOutput = output[i - j];
                console.log('typeof previousOutput', typeof previousOutput);

                // Try to parse previousOutput into an object
                let previousOutputObj = previousOutput;
                try {
                    previousOutputObj = JSON.parse(previousOutput);
                } catch (e) {
                    // Do nothing if parsing fails
                }

                if (typeof previousOutputObj === 'object') {
                    // If it's an object, replace each key in the prompt
                    for (const [key, value] of Object.entries(previousOutputObj)) {
                        const outputRefRegex = new RegExp(`{{output\\[-${j}\\]\\.\\b${key}\\b}}`, 'g');
                        prompt = prompt.replace(outputRefRegex, value);
                    }
                } else {
                    // If it's not an object, replace directly
                    const outputRefRegex = new RegExp(`{{output\\[-${j}\\]}}`, 'g');
                    prompt = prompt.replace(outputRefRegex, `"${previousOutput}"`);
                }
            }

            // Save the prompt with context filled
            contextFilledPrompts.push(prompt);

            // Call the callable function with the prompt and model
            const result = await callable(model, prompt);

            // Save the result in the output list
            output.push(result);
        }
        return [output, contextFilledPrompts];
    }

    static async toDelimTextFile(name, content) {
        let resultString = '';

        for (let i = 0; i < content.length; i++) {
            let item = content[i];

            if (typeof item === 'object') {
                item = JSON.stringify(item);
            }

            const chainTextDelim = `${'🔗'.repeat(i + 1)} -------- Prompt Chain Result #${i + 1} -------------\n\n${item}\n\n`;
            fs.writeFileSync(`${name}.txt`, chainTextDelim, { flag: 'a' });

            resultString += chainTextDelim; // Avoid duplication
        }

        return resultString;
    }
}

module.exports = MinimalChainable;
