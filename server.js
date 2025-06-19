import { app } from "./app.js";

app.listen(process.env.PORT, () =>
  console.log(`this is running in port ${process.env.PORT}.......`)
);
