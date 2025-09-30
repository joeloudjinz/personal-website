export interface Project {
    name: string;
    demoLink: string;
    tags?: string[],
    description?: string;
    postLink?: string;
    demoLinkRel?: string;
    isUnderConstruction: boolean;
    publishedPackageLink?: string;
    version?: string;
    isFeatured: boolean;

    [key: string]: any;
}

export const projects: Project[] = [
    {
        name: "Data Seeder for .NET",
        description: "A powerful and flexible data seeding library for .NET applications, designed to streamline the process of populating databases with test or initial data. It supports environment-specific data, dependency management between seeders, batch processing for large datasets, and hash-based change detection. It integrates seamlessly with Entity Framework.",
        demoLink: 'https://github.com/joeloudjinz/InzSeeder',
        publishedPackageLink: 'https://www.nuget.org/packages/InzSoftwares.NetSeeder/',
        isUnderConstruction: false,
        isFeatured: true,
        version: '2.0.3',
        tags: ['C#', '.NET 9', 'Entity Framework Core', 'NuGet']
    },
    {
        name: "Algerian RIB Validator",
        description: "A set of lightweight packages to validate any Algerian RIB (Relevé d'Identité Bancaire) or RIP (Relevé d'Identité Postal) code according to instruction 06-2004 using a pre-defined list of banks. I worked on this project in collaboration with @itshakim123",
        demoLink: 'https://github.com/itshakim213/rib-validator-dz',
        isUnderConstruction: false,
        isFeatured: false,
        version: '0.0.2',
        tags: ['C#', '.NET 9', 'Node', 'Typescript', 'Javascript', 'NuGet', 'Npm']
    },
    {
        name: "Onion Architecture with .NET",
        description: "A sample project that demonstrates how to adapt Onion Architecture in a .NET project.",
        isUnderConstruction: true,
        isFeatured: false,
        demoLink: 'https://github.com/joeloudjinz/DotNetOnionArchitecture',
        tags: ['C#', '.NET 9', 'Onion Architecture', 'Entity Framework Core']
    },
    {
        name: "Repository Pattern Files Generator for Laravel",
        description: "An old package for Laravel projects, provides a set of feature to help adapt the repository pattern for any given model.",
        isUnderConstruction: false,
        isFeatured: false,
        version: '1.1.0',
        demoLink: 'https://github.com/joeloudjinz/laravel-repository',
        tags: ['PHP 7', 'Laravel 5', 'Repository Pattern']
    }
]
