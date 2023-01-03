import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Response, Request } from "express";

import { ChatsService } from "./chats.service";
import { ChatsGateway } from "./chats.gateway";

@Controller("conversation")
export class ChatController {}