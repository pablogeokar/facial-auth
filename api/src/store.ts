import type { User } from "./types.js";

/**
 * In-memory store. Replace with PostgreSQL + pgvector for production.
 * Each user stores a 128-dim face descriptor as number[].
 */
class UserStore {
    private users = new Map<string, User>();

    add(user: User): void {
        this.users.set(user.id, user);
    }

    update(id: string, data: Partial<Pick<User, "name" | "status">>): User | undefined {
        const user = this.users.get(id);
        if (!user) return undefined;
        if (data.name !== undefined) user.name = data.name;
        if (data.status !== undefined) user.status = data.status;
        return user;
    }

    getById(id: string): User | undefined {
        return this.users.get(id);
    }

    getAll(): User[] {
        return Array.from(this.users.values());
    }

    exists(id: string): boolean {
        return this.users.has(id);
    }

    count(): number {
        return this.users.size;
    }

    delete(id: string): boolean {
        return this.users.delete(id);
    }
}

export const userStore = new UserStore();
