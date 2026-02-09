"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, Trophy, CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import { TeamFormView } from "./team-form-view"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CompetitionTable, TableEntry } from "@/lib/types/data-schema"

interface LeagueTableProps {
    data: CompetitionTable;
    title: string;
    onSeasonChange?: (season: string) => void;
    currentSeason?: string;
}

const SEASONS = ["2025/26", "2024/25", "2023/24"];

export function LeagueTable({ data, title, onSeasonChange, currentSeason = "2025/26" }: LeagueTableProps) {
    const [selectedTeam, setSelectedTeam] = useState<TableEntry | null>(null);

    if (!data || !data.entries) return null;

    const renderForm = (form?: string[]) => {
        if (!form || !Array.isArray(form)) return null;
        return (
            <div className="flex gap-1 justify-center">
                {form.slice(-5).map((res, i) => (
                    <div key={i} title={res === 'W' ? 'Win' : res === 'L' ? 'Loss' : 'Draw'}>
                        {res === 'W' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/20" />
                        ) : res === 'L' ? (
                            <XCircle className="h-4 w-4 text-red-500 fill-red-500/20" />
                        ) : (
                            <MinusCircle className="h-4 w-4 text-gray-400 fill-gray-400/20" />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Card className="rounded-2xl border-2 border-primary/5 bg-card/30 backdrop-blur-md overflow-hidden shadow-2xl">
                <CardHeader className="bg-primary/5 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/20">
                                <Trophy className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black italic uppercase tracking-tighter">
                                    {title}
                                </CardTitle>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">League Standings</p>
                            </div>
                        </div>

                        <Select value={currentSeason} onValueChange={onSeasonChange}>
                            <SelectTrigger className="w-[120px] h-8 rounded-lg border-primary/20 bg-background/50 font-bold text-xs ring-offset-background focus:ring-1 focus:ring-primary/20">
                                <SelectValue placeholder="Season" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 backdrop-blur-xl border-primary/10 rounded-xl">
                                {SEASONS.map(s => (
                                    <SelectItem
                                        key={s}
                                        value={s}
                                        className="font-bold text-xs cursor-pointer focus:bg-primary/10"
                                    >
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10 border-b border-primary/5">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[50px] text-center font-bold text-[10px] uppercase text-muted-foreground">Pos</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground">Club</TableHead>
                                <TableHead className="text-center font-bold text-[10px] uppercase text-muted-foreground">MP</TableHead>
                                <TableHead className="text-center font-bold text-[10px] uppercase text-muted-foreground">W</TableHead>
                                <TableHead className="text-center font-bold text-[10px] uppercase text-muted-foreground">D</TableHead>
                                <TableHead className="text-center font-bold text-[10px] uppercase text-muted-foreground">L</TableHead>
                                <TableHead className="text-center font-bold text-[10px] uppercase text-muted-foreground hidden md:table-cell">GF</TableHead>
                                <TableHead className="text-center font-bold text-[10px] uppercase text-muted-foreground hidden md:table-cell">GA</TableHead>
                                <TableHead className="text-center font-bold text-[10px] uppercase text-muted-foreground hidden md:table-cell">GD</TableHead>
                                <TableHead className="text-center font-black text-[10px] uppercase text-primary">Pts</TableHead>
                                <TableHead className="text-center font-bold text-[10px] uppercase text-muted-foreground w-[120px]">Last 5</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.entries.map((team, i: number) => (
                                <TableRow
                                    key={i}
                                    className="hover:bg-primary/5 transition-colors cursor-pointer group border-b border-primary/5"
                                    onClick={() => setSelectedTeam(team)}
                                >
                                    <TableCell className="text-center font-bold text-muted-foreground group-hover:text-primary transition-colors text-xs">
                                        {i + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded bg-muted/50 flex items-center justify-center text-[10px] font-black text-muted-foreground border border-primary/5">
                                                {team.participant_name.charAt(0)}
                                            </div>
                                            <span className="font-bold tracking-tight text-sm">{team.participant_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-xs">{team.played}</TableCell>
                                    <TableCell className="text-center text-xs">{team.won}</TableCell>
                                    <TableCell className="text-center text-xs">{team.drawn}</TableCell>
                                    <TableCell className="text-center text-xs">{team.lost}</TableCell>
                                    <TableCell className="text-center text-xs hidden md:table-cell opacity-70">{team.goals_for || 0}</TableCell>
                                    <TableCell className="text-center text-xs hidden md:table-cell opacity-70">{team.goals_against || 0}</TableCell>
                                    <TableCell className="text-center text-xs hidden md:table-cell font-bold">
                                        {(team.goals_for || 0) - (team.goals_against || 0) >= 0 ? '+' : ''}
                                        {(team.goals_for || 0) - (team.goals_against || 0)}
                                    </TableCell>
                                    <TableCell className="text-center font-black text-primary bg-primary/5 text-sm">
                                        {team.points}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {renderForm(team.form || ['W', 'D', 'W', 'W', 'L'])}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <TeamFormView
                team={selectedTeam}
                open={!!selectedTeam}
                onOpenChange={(open) => !open && setSelectedTeam(null)}
            />
        </>
    )
}
