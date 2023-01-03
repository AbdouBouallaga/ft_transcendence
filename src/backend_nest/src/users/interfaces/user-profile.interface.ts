import { Exclude, Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsDate,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
    ValidateIf,
} from "class-validator";


export interface UserProfile {
    username: string,
    avatar: string,
};
