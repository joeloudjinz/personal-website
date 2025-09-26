import { getRepositoryDetails } from "../../utils";

export interface Project {
  name: string;
  demoLink: string;
  tags?: string[],
  description?: string;
  postLink?: string;
  demoLinkRel?: string;
  [key: string]: any;
}

export const projects: Project[] = [
  {
    name: "Data Seeder for .NET",
    description: "A powerful and flexible data seeding library for .NET applications, designed to streamline the process of populating databases with test or initial data. It supports environment-specific data, dependency management between seeders, batch processing for large datasets, and hash-based change detection. It integrates seamlessly with Entity Framework.",
    demoLink: 'https://github.com/joeloudjinz/InzSeeder',
    tags: ['C#', '.NET', 'Entity Framework Core'],
		// stargazers_count: 1
  }
]
