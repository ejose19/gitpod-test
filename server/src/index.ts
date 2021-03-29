import http from "http";
import { App } from "./app";

async function main() {
  const app = App();
  const server = http.createServer(app.callback());

  const PORT = process.env.PORT ?? 3000;

  server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });
}

main();
