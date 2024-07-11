const fs = require('fs');

class MinimalChainable {
    static async run(context, model, callable, prompts) {
        let output = [];
        let contextFilledPrompts = [];

        for (let i = 0; i < prompts.length; i++) {
            let prompt = prompts[i];

            // Sustituir variables de contexto en el prompt
            for (const [key, value] of Object.entries(context)) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                prompt = prompt.replace(regex, value);
            }

            // Sustituir referencias a outputs anteriores en el prompt
            for (let j = i; j > 0; j--) {
                const previousOutput = output[i - j];
                console.log('typeof previousOutput', typeof previousOutput);

                // try to parse in to object previousOutput
                let previousOutputObj = previousOutput;
                try {
                    previousOutputObj = JSON.parse(previousOutput);
                } catch (e) {
                    // Do nothing
                }

                if (typeof previousOutputObj === 'object') {
                    // Si es un objeto, reemplazar cada clave en el prompt
                    for (const [key, value] of Object.entries(previousOutputObj)) {
                        const outputRefRegex = new RegExp(`{{output\\[-${j}\\]\\.\\b${key}\\b}}`, 'g');
                        prompt = prompt.replace(outputRefRegex, value);
                    }
                } else {
                    // Si no es un objeto, sustituir directamente
                    const outputRefRegex = new RegExp(`{{output\\[-${j}\\]}}`, 'g');
                    prompt = prompt.replace(outputRefRegex, `"${previousOutput}"`);
                }
            }

            // Guardar el prompt con contexto lleno
            contextFilledPrompts.push(prompt);


            // Llamar a la función callable con el prompt y el modelo
            const result = await callable(model, prompt);

            // Guardar el resultado en la lista de outputs
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

            resultString += chainTextDelim; // Eliminar la duplicación
        }

        return resultString;
    }

}

module.exports = MinimalChainable;
