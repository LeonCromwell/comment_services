import commentRouter from "./comment";

export default function route(app: any) {
  app.use("/", commentRouter);
}
