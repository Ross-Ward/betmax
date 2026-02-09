"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, User, Info, Timer } from "lucide-react"
import { DataEvent } from "@/lib/types/data-schema"

interface HorseMeetingViewProps {
    data: DataEvent[];
}

export function HorseMeetingView({ data }: HorseMeetingViewProps) {
    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((meeting) => (
                <Card key={meeting.id} className="rounded-3xl border-2 border-primary/5 bg-card/40 backdrop-blur-xl overflow-hidden shadow-xl transition-all hover:shadow-2xl hover:border-primary/20 group">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg font-black italic uppercase tracking-tighter">
                                    {meeting.venue} <span className="text-primary">— {meeting.start_time}</span>
                                </CardTitle>
                            </div>
                            <Badge variant="secondary" className="bg-primary/20 text-primary font-bold text-[10px]">LIVE FEEDS</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 p-2 rounded-lg">
                            <span className="flex items-center gap-1"><Info className="h-3 w-3" /> Going: {meeting.metadata?.going || 'Good'}</span>
                            <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> Dist: {meeting.metadata?.distance || '1m'}</span>
                        </div>

                        <div className="space-y-2">
                            {meeting.participants?.map((runner, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-primary/5 hover:bg-background transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center font-black text-primary text-xs border border-primary/10">
                                            {runner.metadata?.rank || idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{runner.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                <User className="h-3 w-3" /> {runner.metadata?.jockey || 'TBA'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-primary text-[10px] font-black italic">{runner.metadata?.form || '0-0-0'}</Badge>
                                        <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Form Guide</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
