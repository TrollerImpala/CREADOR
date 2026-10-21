import { SetMetadata } from "@nestjs/common";
import { Role } from "../enum/roles.enum";

export const Roles = (...role : Role[]) => SetMetadata("roles", role);