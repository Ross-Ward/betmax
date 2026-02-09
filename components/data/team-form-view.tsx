"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy } from "lucide-react"
import { TableEntry } from "@/lib/types/data-schema"
import { cn } from "@/lib/utils"

interface TeamFormViewProps {
    team: TableEntry | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TeamFormView({ team, open, onOpenChange }: TeamFormViewProps) {
    if (!team) return null;

    // Simulate recent results
    const recentResults = [
        { opp: 'Manchester City', score: '2-1', res: 'W', date: 'Dec 22' },
        { opp: 'Arsenal', score: '0-0', res: 'D', date: 'Dec 18' },
        { opp: 'Chelsea', score: '1-2', res: 'L', date: 'Dec 14' },
        { opp: 'Liverpool', score: '3-0', res: 'W', date: 'Dec 10' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-none bg-background/80 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 -z-10" />

                <DialogHeader className="pb-6 border-b border-primary/10">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-black italic text-primary shadow-inner">
                            {team.participant_name.charAt(0)}
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                                {team.participant_name}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-bold">PRO CLUB</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                    <Trophy className="h-3 w-3" /> Standings: {team.points} pts
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Recent Performance</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {recentResults.map((match, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-primary/5 hover:border-primary/20 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg transition-transform group-hover:scale-110",
                                            match.res === 'W' ? "bg-green-500 text-white shadow-green-500/20" :
                                                match.res === 'D' ? "bg-orange-400 text-white shadow-orange-400/20" :
                                                    "bg-red-500 text-white shadow-red-500/20"
                                        )}>
                                            {match.res}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold tracking-tight">vs {match.opp}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {match.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black italic tracking-tighter text-primary">{match.score}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">FINAL</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

