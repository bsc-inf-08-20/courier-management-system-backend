import { Role } from "src/enum/role.enum"

export type CurrentUser =  {
    user_id: number,
    email: string,
    role: Role
}