## Setup

1. Install all the dependencies

```
yarn
```

2. Rename .env.example to .env.local and add your open weather api key.

3. Build the project

```
yarn run build
```

4. Start the development server

```
yarn run start
```

## Testing

To run the linter and the tests in the project:

```
yarn run test
```

## Postman

In the /postman folder you will find a collection that you can import into postman, which contains example calls and end-to-end tests. Remember to set up the collection variables.

## Packages

Packages used in this project:

date-fns - https://snyk.io/advisor/npm-package/date-fns (for date manipulation - will temporal ever arrive?)

dotenv - https://snyk.io/advisor/npm-package/dotenv (for managing env variables)

fastify - https://snyk.io/advisor/npm-package/fastify (for the framework)

fastify-type-provider-zod - https://snyk.io/advisor/npm-package/fastify-type-provider-zod (a type provider for zod)

pino - https://snyk.io/advisor/npm-package/pino (logging)

zod - https://snyk.io/advisor/npm-package/zod (validation and schema)

## Core algorithm

The restrictions are structured as an expression tree / abstract syntax tree, and the requirements are that all errors are collected, and one isn't to cease execution at the first error. Ergo, we need to compute the tree in its entirety.

So, essentially the algorithm does that - it recursively maps through each node in the tree and once it reaches an expression it can evaluate, it computes the result or takes a note of the error before continuing. AND expressions are checked to ensure all conditions are adherent; OR expressions are checked to ensure at least one condition is adherent.

## Improvements

1. Middleware to authenticate incoming requests and rate limit them.
2. A caching layer could be useful on the weather api depending on business requirements;
3. A persisted datastore;
4. We could create some fixtures to make the tests somewhat cleaner.

#### On the topic of improvements, a small note on Math.js

I wasn't sure what liberties I could take with the inputs and outputs, but if one were allowed to take liberties and it suited the business requirements, one library that could be helpful here is Math.js - specifically it's parse function (https://mathjs.org/docs/expressions/expression_trees.html). It would enable the user to send very human-readable inputs to POST /promocode, the frontend could prevalidate inputs easily, and it would be a simpler implementation on the backend.

```

import { parse } from "mathjs";

const restrictions =
  "age > 45 and weatherObservation == Clear and temperatureCelsius > 21";

const expression = parse(restrictions);

const result = expression.eval({
  age: 70,
  weatherObservation: "Clear",
  temperatureCelsius: 25,
});
```

However, it does come with some security implications to think about: https://mathjs.org/docs/expressions/security.html
