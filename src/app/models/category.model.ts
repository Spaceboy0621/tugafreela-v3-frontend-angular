import { Skill } from './skill.model';

export class Category {
    id: number;
    name: string;
    slug: string;
    skills: Skill[];
}