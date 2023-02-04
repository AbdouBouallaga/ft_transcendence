export {};

declare module "socket.io" {
    interface Socket {
        login42 : string;
    }
}