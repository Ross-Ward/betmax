"use client"

import { useState, useEffect } from "react"
import { Trophy, BarChart3, Info, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface EventIntelPanelProps {
    eventName: string;
    sportTitle: string;
}

interface IntelResult {
    datasetName: string;
    data: any;
    sport: string;
}

export function EventIntelPanel({ eventName, sportTitle }: EventIntelPanelProps) {
    const [intel, setIntel] = useState<IntelResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchIntel() {
            setLoading(true);
            try {
                // Try to map sport title to our intelligence datasets
                let datasetName = "";
                const title = sportTitle.toLowerCase();
                if (title.includes('soccer') || title.includes('premier')) datasetName = "pl_table";
                else if (title.includes('f1') || title.includes('formula')) datasetName = "f1_driver_standings";
                else if (title.includes('mma') || title.includes('ufc')) datasetName = "ufc_rankings";
                else if (title.includes('golf') || title.includes('pga')) datasetName = "pga_leaderboard";
                else if (title.includes('horse') || title.includes('racing')) datasetName = "horse_racing_meetings";

                if (!datasetName) {
                    setLoading(false);
                    return;
                }

                const res = await fetch(`/api/datasets/${datasetName}`);
                if (!res.ok) throw new Error("Intelligence unavailable");
                const data = await res.ok ? await res.json() : null;

                // Find relevant context in the data
                // For example, if it's a team, find their league position
                setIntel({
                    datasetName,
                    data,
                    sport: sportTitle
                });
            } catch (e) {
                console.error("Intel fetch failed", e);
                setError("Contextual intelligence currently offline");
            } finally {
                setLoading(false);
            }
        }
        fetchIntel();
    }, [sportTitle, eventName]);

    if (loading) {
        return (
            <Card className="rounded-2xl border-2 border-primary/5 bg-card/30 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-black italic uppercase tracking-tight flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            Intelligence Context
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-mono bg-background">LIVE SYNC</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="rounded-2xl border-2 border-primary/5 bg-card/30 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-black italic uppercase tracking-tight flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            Intelligence Context
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-mono bg-background">LIVE SYNC</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-xs font-medium text-muted-foreground">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!intel) return null;

    return (
        <Card className="rounded-2xl border-2 border-primary/5 bg-card/30 backdrop-blur-md overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black italic uppercase tracking-tight flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Intelligence Context
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] font-mono bg-background">LIVE SYNC</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Active Intelligence</p>
                            <p className="text-sm font-bold truncate">{intel.datasetName.replace(/_/g, ' ').toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-muted/30 p-4 border border-primary/5">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key Data Points</span>
                        </div>

                        <div className="space-y-3">
                            {intel.datasetName === 'pl_table' && intel.data.entries?.slice(0, 3).map((team: { participant_name: string; points: number }, i: number) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-foreground">{team.participant_name}</span>
                                    <div className="flex gap-3">
                                        <span className="text-muted-foreground">Pos: <span className="text-foreground font-bold">{i + 1}</span></span>
                                        <span className="text-muted-foreground">Pts: <span className="text-primary font-bold">{team.points}</span></span>
                                    </div>
                                </div>
                            ))}

                            {intel.datasetName.includes('rank') && intel.data[0]?.entries?.slice(0, 3).map((p: { participant_name: string; rank: number }, i: number) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-foreground">{p.participant_name}</span>
                                    <span className="text-muted-foreground">Rank: <span className="text-primary font-bold">#{p.rank}</span></span>
                                </div>
                            ))}

                            {intel.datasetName.includes('f1') && intel.data.driverStandings?.[0]?.entries?.slice(0, 3).map((d: { participant_name: string; points: number }, i: number) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-foreground">{d.participant_name}</span>
                                    <span className="text-muted-foreground">Pts: <span className="text-primary font-bold">{d.points}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                        System tracked context: This data is extracted from {intel.sport} internal repositories to provide immediate betting context.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
