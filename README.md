# MinimalChainable

**MinimalChainable** is a library designed to facilitate the execution and chaining of prompts, allowing dynamic substitution of context and references to previous results. This guide will help you get started from scratch with the project.

## Using MinimalChainable

### Installation

To begin, install **MinimalChainable** from GitHub using npm:

```bash
npm install <github-repo-url>
```

### Basic Usage

1. **Importing:**
   Import the `MinimalChainable` class into your JavaScript file:

   ```javascript
   const MinimalChainable = require('minimalchainable');
   ```

2. **Defining Context and Prompts:**
   Define a context and a model you'll use, along with a `gpt` function that will make calls to GPT to process prompts:

   ```javascript
   const context = { var1: 'value1', var2: 'value2' };
   const model = {}; // Model to use

   // Function to call GPT
   async function gpt(model, prompt) {
     // Logic to call GPT and get response
     return 'GPT response';
   }

   const prompts = [
     'Prompt with {{var1}} and {{var2}}',
     'Next prompt with {{output[-1]}}',
   ];
   ```

3. **Executing Prompts:**
   Use the static `run` method of `MinimalChainable` to execute prompts with the defined context and the `gpt` function:

   ```javascript
   async function runPrompts() {
     try {
       const [output, contextFilledPrompts] = await MinimalChainable.run(context, model, gpt, prompts);

       // Handle context-filled prompts and obtained results here
       console.log('Context-filled prompts:');
       console.log(contextFilledPrompts);

       console.log('Obtained results:');
       console.log(output);

     } catch (error) {
       console.error('Error:', error);
     }
   }

   runPrompts();
   ```

### Using {{output}} and References

#### {{output[-1]}}

The `{{output[-1]}}` reference in prompts allows you to dynamically insert the result of the immediately preceding prompt into subsequent prompts. This feature is powerful for creating a chain of prompts where each step relies on the output of the previous step.

**Example:**

Suppose you have the following prompts defined:

```javascript
const prompts = [
  'Generate a title for an article about {{topic}}.',
  'Now, summarize the article: {{output}}',
];
```

In this example:
- The first prompt asks for a title related to a specified topic.
- The second prompt uses `{{output}}` to reference the title generated in the first prompt.

When executed with **MinimalChainable**, the prompts might resolve as follows:

```plaintext
Prompt 1: Generate a title for an article about AI Ethics.
Prompt 2: Now, summarize the article: "The Ethics of Artificial Intelligence explores..."

Output: ["The Ethics of Artificial Intelligence explores...", "Summary of the article"]
```

#### Objects in {{output}}

If a prompt result is an object, you can access its properties using dot notation within the prompt. This allows for fine-grained control over how you utilize complex data structures returned from previous prompts.

**Example:**

Consider a scenario where the first prompt returns an object:

```javascript
const prompts = [
  'Generate a blog post with the title: {{output.title}}',
  'Add a hook for the blog post: {{output.hook}}',
];
```

Assume the first prompt outputs the following object:

```javascript
{ title: 'Understanding Machine Learning Algorithms', hook: 'Explore the intricacies of ML algorithms.' }
```

When processed by **MinimalChainable**, the prompts would result in:

```plaintext
Prompt 1: Generate a blog post with the title: Understanding Machine Learning Algorithms
Prompt 2: Add a hook for the blog post: Explore the intricacies of ML algorithms.

Output: [
  { title: 'Understanding Machine Learning Algorithms', hook: 'Explore the intricacies of ML algorithms.' },
  "Hook added to the blog post"
]
```

### When to Use Prompt Chaining

Prompt chaining with **MinimalChainable** can significantly enhance your workflow by breaking down complex tasks and ensuring high performance and accuracy. Here are four guiding questions to determine when to use prompt chaining:

1. **Complex Tasks:** Are you asking your AI to accomplish multiple distantly related tasks in a single prompt?

2. **Performance and Error Reduction:** Do you need to maximize prompt performance and minimize errors?

3. **Previous Output as Input:** Do subsequent prompts require the output of a previous prompt as input?

4. **Adaptive Workflow:** Do you need an adaptive workflow that adjusts based on prompt outcomes?

Prompt chaining addresses these needs by structuring interactions in a logical sequence, enhancing clarity, and ensuring each step builds upon the last effectively.

### Summary

**MinimalChainable** equips you with practical examples to harness the power of dynamic prompt chaining and output referencing. By leveraging `{{output}}` and handling objects within prompts, you can automate complex text generation workflows and integrate decision-making processes seamlessly into your applications.

### Additional Considerations

When integrating **MinimalChainable** into your projects, remember:
- Stay close to the prompt to maintain clarity and control.
- Avoid unnecessary abstractions to maintain simplicity and debugging efficiency.
- Start with minimal, purposeful code that accomplishes specific tasks effectively.
