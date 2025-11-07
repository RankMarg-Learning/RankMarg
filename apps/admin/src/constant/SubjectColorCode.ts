import { Book, FlaskConical, Sigma, Atom, PersonStanding } from "lucide-react";

export const SubjectIcons = {
    physics: Atom,
    chemistry: FlaskConical,
    mathematics: Sigma,
    biology: PersonStanding,
    default: Book,
} as const;



export const SubjectCardColor = {
    physics: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/30",
    chemistry: "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/30",
    mathematics: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/30",
    biology: "border-green-200 bg-gradient-to-br from-green-50 to-green-100/30",
    default: "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/30",
}

export const SubjectTextColor = {
    physics: "text-purple-600",
    chemistry: "text-amber-600",
    biology: "text-green-600",
    mathematics: "text-blue-600",
    default: "text-gray-600",
}
export const SubjectBackgroundColor = {
    physics: "bg-purple-400",
    chemistry: "bg-amber-400",
    mathematics: "bg-blue-400",
    biology: "bg-green-400",
    default: "bg-gray-400",
}