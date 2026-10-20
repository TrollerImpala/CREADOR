# Backend Project

This service is built with NestJS and uses Bun for local development and Yarn for deployment-oriented install and build steps.

## Local development

```bash
$ bun install
$ bun run start:dev
```

## Production / deploy

```bash
$ yarn install --frozen-lockfile
$ yarn build
$ yarn start
```

## Environment

The runtime configuration is in [backend/src/main.ts](src/main.ts), where the service uses the `PORT` environment variable and falls back to `8080`.

## Project setup

### Local development with Bun
```bash
$ bun install
$ bun run start:dev
```

### Production / deploy pipeline with Yarn
```bash
$ yarn install --frozen-lockfile
$ yarn build
$ yarn start
```

## Run tests

```bash
# unit tests
$ bun test

# e2e tests
$ bunx jest --config ./test/jest-e2e.json

# test coverage
$ bunx jest --coverage
```

## Deployment notes

This repository uses:
- Bun for local development, backed by the lockfile in this directory
- Yarn for deploy and production-oriented install/build commands, aligned with the Render configuration in [render.yaml](../render.yaml)

The application runtime is configured in [backend/src/main.ts](src/main.ts) and uses the `PORT` environment variable, falling back to `8080`.

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
