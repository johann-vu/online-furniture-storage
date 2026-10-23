export interface Category {
    id: string
    label: string
    icon: string | undefined
    properties : Property[]
}

export interface Property {
    id: string
    label: string
    helptext: string
}

export const Categories: Category[] = [
    {
        id: "furniture",
        label: "Möbelstück",
        icon: undefined,
        properties: [
            {
                id: "size",
                label: "Maße",
                helptext: "Wie groß ist das Möbelstück ungefähr?"
            }
        ]
    },
    {
        id: "bike",
        label: "Fahrrad",
        icon: undefined,
        properties: [
            {
                id: "size",
                label: "Größe",
                helptext: "Welche Rahmengröße hat das Fahrrad oder wie groß ist es ungefähr?"
            }
        ]
    }
]