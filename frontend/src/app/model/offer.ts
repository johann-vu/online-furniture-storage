export interface CreateOfferDTO {
    title: string
    size: string
    available_until: string
    name: string
    phone: string
    photos: File[]
    privacy: boolean
    nearby: boolean
    category: string
}

export interface ReadOfferDTO {
    title: string
    size: string
    available_until: string
    name: string
    phone: string
    photos: string[]
    id: string,
    created: string
    category: string
}