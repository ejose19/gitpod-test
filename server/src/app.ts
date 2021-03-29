import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { logging } from "./logger";
import { router } from "./routes";

export function App() {
  const app = new Koa();

  app.use(logging());

  app.use(bodyParser());

  app.use(router().routes());
  app.use(router().allowedMethods());

  return app;
}
