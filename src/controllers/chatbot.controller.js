// import { NeuralNetwork } from 'brain.js';
// import natural from 'natural';
// import fs from 'fs';


// export const chat = async (req,res,next)=>{
// const question = req.body.question
// console.log(req.body)

// const tokenizer = new natural.WordTokenizer();
// const stemmer = natural.PorterStemmer;

// // const question = "tell me about software engineering field";
// const tokens = tokenizer.tokenize(question);

// // Using stemming
// const stemmedTokens = tokens.map(token => stemmer.stem(token));

// // Make tokens lowercase for case-insensitive matching
// const lowerCaseTokens = stemmedTokens.map(token => token.toLowerCase());

// const generalGreetings = ['hello', 'hi', 'hey', 'hello there', 'good day'];
// const containsGeneralGreeting = lowerCaseTokens.some(token => generalGreetings.includes(token));

// const currentTime = new Date();
// const currentHour = currentTime.getHours();
// let timeOfDayGreeting = '';
// if (currentHour >= 5 && currentHour < 12) {
//   timeOfDayGreeting = 'good morning';
// } else if (currentHour >= 12 && currentHour < 17) {
//   timeOfDayGreeting = 'good afternoon';
// } else {
//   timeOfDayGreeting = 'good evening';
// }

// const departmentDescriptions = {
//   'computer science': 'Computer Science is the study of algorithms, data structures, and the design and analysis of computer systems.',
//   // ... add other departments and their descriptions as needed
// };

// const fieldDescriptions = {
//   'software engineering': 'Software Engineering focuses on designing, developing, and maintaining software applications in a systematic, disciplined, and efficient manner.',
//   'system and networks': 'System and Networks delves into the design, analysis, and management of interconnected systems and networks.',
//   'genie logiciel': 'Genie Logiciel provides a comprehensive understanding of software design principles in the French educational context.',
//   // ... add other fields and their descriptions as needed
// };

// if (containsGeneralGreeting) {
//   const randomGreeting = generalGreetings[Math.floor(Math.random() * generalGreetings.length)];
//   console.log(`${randomGreeting}! How can I assist you today?`);
//   return res.status(200).json({message:`${randomGreeting}! How can I assist you today?`})
// } else if (
//   lowerCaseTokens.includes(stemmer.stem('name')) || 
//   (lowerCaseTokens.includes(stemmer.stem('who')) && lowerCaseTokens.includes(stemmer.stem('director')))
// ) {
//   const directorName = "Armand Claude ABANDA";
//   console.log(`The name of the school director is ${directorName}.`);
//   return res.status(200).json({message:`The name of the school director is ${directorName}.`})
// } else if (
//   lowerCaseTokens.includes(stemmer.stem('fee')) || lowerCaseTokens.includes(stemmer.stem('tuition'))
// ) {
//   const schoolFee1 = "420 000 CFA per annum";
//   const schoolFee2 = "480 000 CFA per annum";
//   const schoolFee3 = "500 000 CFA per annum";
//   console.log(`The school fee for Level 1 is ${schoolFee1}.`);
//   console.log(`The school fee for Level 2 is ${schoolFee2}.`);
//   console.log(`The school fee for Level 3 is ${schoolFee3}.`);
//   return res.status(200).json({message:`The school fee for level 1,2 and 3 are ${schoolFee1},${schoolFee2},${schoolFee3} respectively`})
// } else if (
//   lowerCaseTokens.includes(stemmer.stem('department'))
// ) {
//   const departments = Object.keys(departmentDescriptions).join(', ');
//   console.log(`Our school offers the following departments: ${departments}.`);
//   let msg = `Our school offers the following departments: ${departments}.`
  
//   // Check if user is asking about a specific department's description
//   for (let department in departmentDescriptions) {
//     if (question.toLowerCase().includes(department)) {
//       console.log(`About the ${department} department: ${departmentDescriptions[department]}`);
//       msg = msg + `About the ${department} department: ${departmentDescriptions[department]}`
//     }
//   }
//   return res.status(200).json({message:msg})
// } else if (
//   lowerCaseTokens.includes(stemmer.stem('field')) || lowerCaseTokens.includes(stemmer.stem('study'))
// ) {
//   const fields = Object.keys(fieldDescriptions).join(', ');
//   console.log(`We offer courses in the following fields of study: ${fields}.`);
//   let msg1 = `We offer courses in the following fields of study: ${fields}.`
//   // Check if the user is asking about a specific field's description
//   for (let field in fieldDescriptions) {
//     if (question.toLowerCase().includes(field)) {
//       console.log(`About the ${field} field: ${fieldDescriptions[field]}`);
//       msg1 = msg1 + `About the ${field} field: ${fieldDescriptions[field]}`
//     }
//   }
//   return res.status(200).json({message:msg1})
// } else {
//   // req.body.train = true
//   // chatai(req ,res)
//   next()
// //   return res.json({
// //     message: `${timeOfDayGreeting}! I don't understand the context of the question.`
// // }); 
// }

// }



// export const chatai = async (req,res)=>{
//   const question = req.body.question
//   const train = req.body.train
//   console.log(req.body)

//   const net = new NeuralNetwork();
//   if(!question){
//     return res.send({
//       result: 'Please provide a question'
//     });
//   }else{
//     const tokenizer = new natural.WordTokenizer();

//     const directorQuestions = [
//       "Who is the director?",
//       "Can you tell me the name of the director?",
//       "I want to know the director's name.",
//       "Who's in charge here?",
//       "Who runs the school?",
//       "Who oversees the school?",
//       "Who holds the position of director?",
//       "Who is the head of this institution?",
//       "Can I get the director's name?",
//       "Who leads the school?",
//       "Tell me the name of the person in charge.",
//       "Who is the chief executive of this school?",
//       "What's the name of the school's top official?",
//       "Who is the highest authority here?",
//       "Whose leadership is the school under?",
//       "Could you provide me with the name of the principal?",
//       "I'm interested in knowing the name of the school's head.",
//       "Who is the main person responsible for the school?",
//       "Whom does the school report to?",
//       "Under whose guidance is the school currently?",
//       "Who's the school's main administrator?",
//       "Who sits at the helm of the school?",
//       "I'd like to know about the school's leadership.",
//       "What's the title and name of the person leading this institution?",
//       "Could you tell me about the director's background?",
//       "Who has the final say in the school's decisions?",
//       "Whose vision is the school following?",
//       "Who was appointed as the director of this school?",
//       "Is there a main person or head that oversees everything here?",
//       "Who is the topmost official in this institution?",
//       "Under whom is the school's administration?",
//       "Could you mention the name of the school's chief?",
//       "Who is the figurehead of this educational institution?",
//       "What is the name of the person who manages this place?",
//       "Who is at the top of the school's hierarchy?",
//       "I'd like to speak with the director. What's their name?",
//       "Who carries the main responsibility for the school's operations?",
//       "To whom do all the staff members report?",
//       "Who was selected as the head for this school?",
//       "Who is the face of this institution?",
//       "I'm curious, who is in the leadership role here?"
//   ];
  
//   const feeQuestions = [
//       "What's the fee for Level 1?",
//       "How much is the tuition?",
//       "Tell me about the school fees.",
//       "What is the cost of tuition for Level 2?",
//       "How much do I need to pay for Level 3?",
//       "Is there a breakdown of the fees?",
//       "What's the tuition for the entire year?",
//       "How are the fees structured?",
//       "Do I get any discounts on fees?",
//       "What's the difference in fees between levels?",
//       "Can I get a detailed fee structure?",
//       "Are there any additional charges other than the tuition?",
//       "Do you have a monthly payment plan for the fees?",
//       "Are there any scholarships or financial aids available?",
//       "What does the fee include? Are books and materials covered?",
//       "Is there a separate registration or admission fee?",
//       "How does the fee compare to other institutions?",
//       "Are there any hidden charges I should be aware of?",
//       "When is the deadline for fee payment?",
//       "Are there late fees if I don't pay on time?",
//       "Is there a refund policy in place if I withdraw?",
//       "Do you offer any sibling or family discounts?",
//       "How can I make the payment? Are there online options available?",
//       "Do you offer any installment options for fee payment?",
//       "Is there a difference in fees for domestic and international students?",
//       "What are the consequences of not paying the fees on time?",
//       "Are there any extracurricular fees apart from the tuition?",
//       "What's the tuition for part-time students?",
//       "How often do you revise the fee structure?",
//       "Do the fees include any insurance or medical coverage?",
//       "What facilities or services are covered under the given fees?",
//       "How much more will I need to pay for boarding or housing?",
//       "Is there an application fee?",
//       "Are there any discounts for early payments?",
//       "Do you have any work-study programs to aid with fees?",
//       "Are meals and transportation included in the fees?",
//       "What's the fee for extracurricular activities or clubs?",
//       "Do I need to pay separately for lab or equipment usage?",
//       "How do the fees change if I opt for summer classes?",
//       "What's the policy for fee waivers or reductions?",
//   ];
  
//   const departmentQuestions = [
//       "Which departments do you have?",
//       "Tell me about your departments.",
//       "I'm interested in the departments you offer.",
//       "Can I get a list of departments?",
//       "Which fields can I study in your institution?",
//       "What departments are available for study?",
//       "Do you have a Computer Science department?",
//       "What's offered in the Engineering department?",
//       "Can I enroll in the Business department?",
//       "How many departments does the school have?",
//       "Can you list the departments provided at your school?",
//       "Which academic disciplines does your school cater to?",
//       "What's the range of departmental offerings at your institution?",
//       "I'm keen to understand the academic specializations available. Can you tell me?",
//       "Which academic departments can I enroll in at your school?",
//       "Could you enumerate the fields of study your school offers?",
//       "I'm looking at your academic offerings. Which departments are there?",
//       "For academic pursuits, what departments do you have?",
//       "Can you clarify the academic disciplines covered by your institution?",
//       "What are the departmental options available for students at your school?",
//       "Can you detail the academic departments present in your institution?",
//       "I'm curious about the disciplines taught here. Can you list them?",
//       "Could you mention the departmental specializations available at your school?",
//       "I'd like to understand the academic breadth of your institution. What departments do you offer?",
//       "Enumerate the academic departments you have in place.",
//       "Can you provide an overview of the study disciplines at your school?",
//       "Highlight the academic departments available at your institution.",
//       "Please share the departments that students can choose from at your school.",
//       "Could you shed light on the academic sections or departments of your school?",
//       "In terms of academic offerings, which departments can one find here?",
//       "List the disciplines or departments that are a part of your academic offerings.",
//       "I'm considering your institution for my studies. Can you tell me about the departments available?",
//       "Offer me a glimpse into the academic departments present in your school.",
//       "I want to get a sense of the academic variety at your institution. Which departments do you have?",
//       "For a prospective student, which departments can they look into?",
//       "Could you provide clarity on the academic departments present at your institution?",
//       "Please elucidate on the range of departments your school offers.",
//       "Highlight the academic sectors or departments present at your school.",
//       "Could you guide me through the departments available for study here?",
//       "Brief me about the academic disciplines or departments at your school.",
//   ];
  
//   const fieldQuestions = [
//       "What can I study here?",
//       "What are the fields of study?",
//       "Can you provide information about the fields?",
//       "I'd like to know more about the fields of study.",
//       "Tell me about the Software Engineering field.",
//       "What courses are offered in the Systems and Networks field?",
//       "Is there a program for Genie Logiciel?",
//       "What fields are most popular among students?",
//       "Do you offer postgraduate fields?",
//       "Can I specialize in multiple fields?",
//       "Could you explain the emphasis of your Software Engineering program?",
//       "I'm interested in System and Networks. What does it encompass?",
//       "What is the Genie Logiciel field about?",
//       "Can you describe the curriculum for Software Engineering?",
//       "What are the core topics covered in the System and Networks field?",
//       "I've heard of Genie Logiciel in a French context. Can you explain more about it?",
//       "Could you provide insights into the primary areas of study available at your institution?",
//       "I'm contemplating Software Engineering as my field. What does it cover?",
//       "In terms of course material, what can one expect from the System and Networks program?",
//       "Tell me more about the pedagogical approach of the Genie Logiciel field.",
//       "What differentiates your Software Engineering program from others?",
//       "How is System and Networks structured in terms of content and learning outcomes?",
//       "Can you provide a brief about Genie Logiciel in the context of your academic offerings?",
//       "When we talk about Software Engineering, what are its primary facets here?",
//       "For someone interested in interconnected systems, what does System and Networks offer?",
//       "Is Genie Logiciel a specialized field tailored to the French curriculum?",
//       "What are the foundational subjects in the Software Engineering field at your institution?",
//       "Elucidate the areas covered under the System and Networks program.",
//       "I've come across the term Genie Logiciel. Can you clarify its significance in your academic context?",
//       "I'm keen on understanding the software application lifecycle. Does Software Engineering cover it?",
//       "Could you shed light on the subjects integral to the System and Networks field?",
//       "How does Genie Logiciel fit into the broader academic framework of your institution?",
//       "In terms of designing and developing software, what does Software Engineering teach?",
//       "What insights does the System and Networks program provide about modern interconnected technologies?",
//       "Genie Logiciel sounds intriguing. Can you delve deeper into its core content?",
//       "I've always been curious about the rigorous methods in software development. Is that a focus in Software Engineering?",
//       "Can you provide an overview of the tools and techniques taught in System and Networks?",
//       "Considering the global landscape, how does Genie Logiciel prepare students?",
//       "From a student's perspective, what are the highlights of the Software Engineering field?",
//       "When considering the evolution of networks, how comprehensive is the System and Networks program?"
//   ];

//   const salutations = [
//     "Hello",
//     "Hi",
//     "Greetings",
//     "Good morning",
//     "Good afternoon",
//     "Good evening",
//     "Howdy",
//     "Hey",
//     "Yo",
//     "What's up?",
//     "How's it going?",
//     "How are you doing?",
//     "How are you today?",
//     "What's good?",
//     "What can I do for you?",
//     "How can I help you?",
//     "Welcome to [chatbot name]!",
//     "It's a pleasure to meet you!",
//     "How may I address you?",
//     "What's your name?",
//     "What should I call you?",
//     "Nice to meet you, [user name]!",
//     "Long time no see, [user name]!",
//     "It's good to see you again, [user name]!",
//     "How can I make your day better, [user name]?",
//     "What's on your mind today, [user name]?",
//     "What can I do to make your life easier, [user name]?",
//     "I'm here to help, [user name]!",
//     "Just let me know what you need, [user name]!",
//     "I'm at your service, [user name]!",
//     "How may I be of assistance, [user name]?",
//     "What brings you here today, [user name]?",
//     "How can I make your experience today as pleasant as possible, [user name]?",
//     "I'm happy to help in any way I can, [user name]!",
//     "What's your pleasure today, [user name]?",
//     "What can I do to make your visit worthwhile, [user name]?",
//     "I'm here to make your day better, [user name]!",
//     "How can I make your life easier today, [user name]?",
//     "I'm here to help you achieve your goals, [user name]!",
//     "What can I do to make your dreams come true, [user name]?",
//     "I'm here to make your life more enjoyable, [user name]!",
//     "How can I make you smile today, [user name]?",
//     "I'm here to make your day brighter, [user name]!"
//   ];

//   const locationQuestions = [
//   "Can you tell me the address of {} in Cameroon?",
//   "Could you please provide me with the location of {} in Cameroon?",
//   "I'm wondering where {} is situated in Cameroon.",
//   "Can you help me find the whereabouts of {} in Cameroon?",
//   "Would you mind pointing me to {} in Cameroon?",
//   "I'm looking for {} in Cameroon. Do you know where it is?",
//   "Can you give me directions to {} in Cameroon?",
//   "I'm trying to locate {} in Cameroon. Can you assist me?",
//   "Could you please tell me how to get to {} in Cameroon?",
//    "Where is this school located in Cameroon?",
//    "Can you tell me the address of this school in Cameroon?",
//    "Could you please provide me with the location of this school in Cameroon?",
//    "I'm wondering where this school is situated in Cameroon.",
//   "Can you help me find the whereabouts of this school in Cameroon?",
//   "Would you mind pointing me to this school in Cameroon?",
//   "I'm looking for this school in Cameroon. Do you know where it is?",
//    "Can you give me directions to this school in Cameroon?",
//    "I'm trying to locate this school in Cameroon. Can you assist me?",
//   "Could you please tell me how to get to this school in Cameroon?",
//   "In what part of Cameroon is {} located?",
//   "Can you tell me the region of Cameroon where {} is situated?",
//   "Could you please provide me with the coordinates of {} in Cameroon?",
//   "I'm wondering what the nearest town or city to {} in Cameroon is.",
//   "Can you help me find a map of Cameroon that shows the location of {}?",
//   "Would you mind pointing me to {} on a map of Cameroon?",
//   "I'm looking for information about the neighborhood where {} is located in Cameroon.",
//   "Can you give me some details about the area surrounding {} in Cameroon?",
//   "I'm trying to learn more about the transportation options available near {} in Cameroon.",
//   "Could you please tell me the best way to get to {} by public transportation in Cameroon?",
// ]
    
//     const generateDataset = (questions, label) => {
//         return questions.map(question => ({
//             input: question,
//             output: [label]
//         }));
//     };
    
//     const trainingData  = [
//       ...generateDataset(salutations, 'salutation'),
//         ...generateDataset(directorQuestions, 'school director'),
//         ...generateDataset(feeQuestions, 'school fees'),
//         ...generateDataset(departmentQuestions, 'departments'),
//         ...generateDataset(fieldQuestions, 'fields of study'),
//         ...generateDataset(locationQuestions, 'where is the school')

//     ];
    
//     // Build a vocabulary from your training data
//     let vocabulary = {};

//     trainingData.forEach(data => {
//         const tokens = tokenizer.tokenize(data.input);
//         tokens.forEach(token => {
//             if (!vocabulary[token]) {
//                 vocabulary[token] = Object.keys(vocabulary).length;
//             }
//         });
//     });
//     const uniqueOutputs = ["school director", "school fees", "departments", "fields of study" ,"salutation" ,"where is the school"];
//     function interpretPrediction(predictions) {
//       const maxProbabilityIndex = predictions.indexOf(Math.max(...predictions));
//       return uniqueOutputs[maxProbabilityIndex];
//   }

//   function generateResponse(label) {
//       switch (label) {
//           case "salutation":
//               return "How can i help you ?"
//               case "where is the school":
//                 return "The school is located at Yaounde-Nkolanga and has other sub centers all round Cameroon"
//           case "school director":
//               return "The director of the school is Mr. Armand Claude ABANDA";
//           case "school fees":
//               const schoolFee1 = "469 000 CFA per annum";
//               const schoolFee2 = "461 000 CFA per annum";
//               const schoolFee3 = "500 000 CFA per annum";
//               console.log(`The school fee for Level 1 is ${schoolFee1}. The school fee for Level 2 is ${schoolFee2}. The school fee for Level 3 is ${schoolFee3}.`);
//               return (`The school fee for Level 1 is ${schoolFee1}`,`The school fee for Level 2 is ${schoolFee2}`,`The school fee for Level 3 is ${schoolFee3}`);
//           case "departments":
//               return "Department of Computer Sciences";
//           case "fields of study":
//               return (
//                 ` software engineering : Software Engineering focuses on designing, developing, and maintaining software applications in a systematic, disciplined, and efficient manner.
//                   system and networks : System and Networks delves into the design, analysis, and management of interconnected systems and networks.
//                   genie logiciel : Genie Logiciel provides a comprehensive understanding of software design principles in the French educational context.
//                 `
//                 );
//           default:
//               return "I'm sorry, I couldn't understand your question.";
//       }
//   }
  
//     function labelToOneHot(label) {
//         return uniqueOutputs.map(output => output === label ? 1 : 0);
//     }
//     // Convert text into one-hot encoded vectors
//     function textToOneHot(text) {
//       const tokens = tokenizer.tokenize(text);
//       const oneHotVector = [];
  
//       for (let key in vocabulary) {
//           oneHotVector.push(tokens.includes(key) ? 1 : 0);
//       }
  
//       return oneHotVector;
//   }
//     // Replace your preprocessing step with the one-hot encoded vectors
//     const processedData = trainingData.map(data => ({
//       input: textToOneHot(data.input),
//       output: labelToOneHot(data.output[0])  // Assuming output is always an array with a single label
//   }));
    
//     // Check if we have a trained network saved already
//     if (fs.existsSync('trainedNet.json') && !train) {
//         // Load the saved trained state
//         const savedNetJSON = JSON.parse(fs.readFileSync('trainedNet.json', 'utf-8'));
//         net.fromJSON(savedNetJSON);
//     } else {
//         // Training        
//         net.train(processedData);
//         // Save the trained network state
//         const trainedNetJSON = net.toJSON();
//         fs.writeFileSync('trainedNet.json', JSON.stringify(trainedNetJSON));
//     }
//     // Evaluation & Usage

//     const processedQuestion = textToOneHot(question);
//     const userResult = net.run(processedQuestion);    
//     const predictedLabel = interpretPrediction(Array.from(userResult));
//     const response = generateResponse(predictedLabel);

// console.log(response)

//     res.json({
//       message: response
//     });
//   // // 5. Usage
//   // const question = 'information about departments';
//   // const processedQuestion = Array.from(natural.BayesClassifier.documentToFeatures(question));
//   // const userResult = net.run(processedQuestion);
//   // console.log(userResult);  // It will output a probability distribution over the outputs
// }
  
// }