"use client"

import { useState, useEffect } from "react"
import {
    Activity,
    RefreshCcw,
    Database,
    Trophy,
    Calendar,
    Users,
    ChevronRight,
    Search,
    ShieldCheck,
    History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function StatsDashboard() {
    const [datasets, setDatasets] = useState<string[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedDataset, setSelectedDataset] = useState<string | null>(null)
    const [dataContent, setDataContent] = useState<any>(null)
    const [isLoadingData, setIsLoadingData] = useState(false)

    useEffect(() => {
        fetchDatasets()
    }, [])

    const fetchDatasets = async () => {
        try {
            const res = await fetch('/api/datasets')
            const data = await res.json()
            setDatasets(data.active_datasets || [])
        } catch (e) {
            console.error(e)
        }
    }

    const triggerRefresh = async () => {
        setIsRefreshing(true)
        try {
            await fetch('/api/datasets', { method: 'POST' })
            // Polling for datasets since it's backgrounded
            const interval = setInterval(async () => {
                const res = await fetch('/api/datasets')
                const data = await res.json()
                if (data.active_datasets?.length > datasets.length) {
                    setDatasets(data.active_datasets)
                    clearInterval(interval)
                    setIsRefreshing(false)
                }
            }, 5000)

            // Timeout safety
            setTimeout(() => {
                clearInterval(interval)
                setIsRefreshing(false)
            }, 60000)
        } catch (e) {
            setIsRefreshing(false)
        }
    }

    const loadDatasetContent = async (name: string) => {
        setIsLoadingData(true)
        setSelectedDataset(name)
        try {
            const res = await fetch(`/api/datasets/${name}`)
            const data = await res.json()
            setDataContent(data)
        } catch (e) {
            console.error(e)
            setDataContent({ error: "Failed to load dataset content." })
        } finally {
            setIsLoadingData(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl border bg-card/30 backdrop-blur-xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 -m-20 h-80 w-80 bg-primary/10 blur-[100px] pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                                <Database className="h-6 w-6" />
                            </div>
                            <Badge variant="outline" className="font-mono text-[10px] tracking-tight border-primary/20">DATASET ENGINE V1.0</Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
                            Sports Data <span className="text-primary italic">Vault</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl text-lg font-medium leading-relaxed">
                            Your independent repository of high-fidelity sports intelligence. Scraped, normalized, and stored locally for lightning-fast orchestration.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={triggerRefresh}
                        disabled={isRefreshing}
                        className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all group"
                    >
                        <RefreshCcw className={cn("mr-2 h-5 w-5 transition-transform duration-1000", isRefreshing && "animate-spin")} />
                        {isRefreshing ? "SYNCING VAULT..." : "REFRESH ALL DATASETS"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Dataset List */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-2xl border-2 border-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    Active Datasets
                                </CardTitle>
                                <Badge variant="secondary" className="rounded-md font-mono">{datasets.length}</Badge>
                            </div>
                            <CardDescription className="text-xs font-medium uppercase tracking-widest mt-1">Verified local repositories</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {datasets.length > 0 ? (
                                <div className="divide-y divide-primary/5">
                                    {datasets.map((name) => (
                                        <button
                                            key={name}
                                            onClick={() => loadDatasetContent(name)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 transition-all hover:bg-primary/5 group",
                                                selectedDataset === name ? "bg-primary/10 border-r-4 border-primary" : ""
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {name.includes('ranking') || name.includes('standings') ? <Trophy className="h-5 w-5 text-amber-500" /> :
                                                        name.includes('events') || name.includes('fixtures') || name.includes('historical') ? <Calendar className="h-5 w-5 text-blue-500" /> :
                                                            <Users className="h-5 w-5 text-primary" />}
                                                </div>
                                                <div className="text-left">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm tracking-tight">{name.replace(/_/g, ' ').toUpperCase()}</p>
                                                        {name.startsWith('kaggle') && (
                                                            <Badge variant="outline" className="h-4 px-1 text-[8px] bg-blue-500/5 text-blue-500 border-blue-500/20">KAGGLE</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-mono">
                                                        {name.startsWith('kaggle') ? "External Archive" : "Live Scrape Stream"}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center space-y-4">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        <History className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">No datasets found in vault.<br />Run sync to populate.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-none bg-gradient-to-br from-primary to-primary-foreground p-6 text-white shadow-2xl">
                        <div className="space-y-4">
                            <Activity className="h-10 w-10 opacity-50" />
                            <h3 className="text-xl font-black italic tracking-tight uppercase">Platform Stitching</h3>
                            <p className="text-sm font-medium opacity-90 leading-relaxed">
                                These datasets are designed to be stitched to live streams in real-time. Link IDs across all scrapers are now normalized.
                            </p>
                            <Button variant="secondary" className="w-full font-bold rounded-xl mt-4 bg-white/10 hover:bg-white/20 border-white/20 text-white">
                                LEARN ARCHITECTURE
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right: Detailed View */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-2 items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Query internal intelligence..."
                                className="h-12 pl-12 rounded-2xl border-2 border-primary/5 bg-card/50 shadow-sm"
                            />
                        </div>
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-bold px-3 py-1">
                            ON-DEMAND SCRAPING ACTIVE
                        </Badge>
                    </div>

                    <Card className="rounded-3xl border-2 border-primary/5 bg-card/30 backdrop-blur-md min-h-[600px] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />

                        {selectedDataset ? (
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 rounded-2xl bg-primary/10 font-black text-primary italic uppercase tracking-tighter text-2xl">
                                            {selectedDataset.split('_')[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black italic uppercase tracking-tight">{selectedDataset.replace(/_/g, ' ')}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[10px] font-mono">ID: {selectedDataset}</Badge>
                                                <Badge variant="outline" className="text-[10px] font-mono bg-green-500/5 text-green-500 border-green-500/10">INTELLIGENCE SYNCED</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cache Status</p>
                                        <p className="text-sm font-mono font-bold text-primary">AUTO-REFRESHING</p>
                                    </div>
                                </div>

                                <div className="bg-background/80 rounded-2xl p-6 border border-primary/5 font-mono text-[13px] overflow-auto max-h-[600px] leading-relaxed text-foreground shadow-inner custom-scrollbar">
                                    {isLoadingData ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-primary font-bold animate-pulse">
                                                <RefreshCcw className="h-5 w-5 animate-spin" />
                                                EXECUTING ON-DEMAND LIVE SCRAPE...
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                                                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                                                <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium italic">
                                                System is currently visiting the sports complex, clearing cookie barriers, and extracting high-fidelity elements. Please wait up to 30 seconds.
                                            </p>
                                        </div>
                                    ) : (
                                        <pre className="whitespace-pre-wrap break-all">
                                            {JSON.stringify(dataContent, null, 2)}
                                        </pre>
                                    )}
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl border bg-muted/20">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Sport Elements</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="text-[10px]">Rankings</Badge>
                                            <Badge variant="secondary" className="text-[10px]">Tables</Badge>
                                            <Badge variant="secondary" className="text-[10px]">Fixtures</Badge>
                                            <Badge variant="secondary" className="text-[10px]">Stats</Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl border bg-primary/5 border-primary/10">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Platform Stitching</h4>
                                        <p className="text-[11px] font-medium text-muted-foreground">This dataset is mapped to live stream IDs for real-time overlay synchronization.</p>
                                    </div>
                                </div>
                            </CardContent>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[600px] text-center p-12">
                                <div className="h-24 w-24 rounded-3xl bg-primary/5 flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl animate-pulse" />
                                    <Database className="h-12 w-12 text-primary relative z-10" />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tight mb-3">Intelligence Terminal</h3>
                                <p className="text-muted-foreground max-w-md font-medium text-lg lg:px-8">
                                    Select a target from the sidebar. Our <span className="text-primary font-bold">On-Demand Intelligence</span> will automatically verify the cache and perform a live extraction if data is stale.
                                </p>
                                <div className="mt-12 flex items-center gap-6 opacity-40">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-10 w-10 border-2 rounded-xl flex items-center justify-center font-bold">PL</div>
                                        <span className="text-[10px] font-bold">SOCCER</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-10 w-10 border-2 rounded-xl flex items-center justify-center font-bold">F1</div>
                                        <span className="text-[10px] font-bold">FORMULA1</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-10 w-10 border-2 rounded-xl flex items-center justify-center font-bold">UFC</div>
                                        <span className="text-[10px] font-bold">MMA</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-10 w-10 border-2 rounded-xl flex items-center justify-center font-bold">PGA</div>
                                        <span className="text-[10px] font-bold">GOLF</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Intel Blueprint Section */}
            <div className="pt-8 border-t border-primary/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tight">Sport Intelligence Blueprint</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Normalized extraction mapping & targets</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {[
                        { sport: 'SOCCER', icon: '⚽', elements: ['Standings', 'Fixtures', 'Squad Stats'], source: 'PremierLeague.com' },
                        { sport: 'FORMULA 1', icon: '🏎️', elements: ['Drivers', 'Teams', 'Tracks'], source: 'Formula1.com' },
                        { sport: 'MMA', icon: '🥊', elements: ['UFC Rankings', 'Tapology Form'], source: 'UFC.com' },
                        { sport: 'GOLF', icon: '⛳', elements: ['Leaderboard', 'OWGR Rankings'], source: 'PGATour.com' },
                        { sport: 'RACECARDS', icon: '🐎', elements: ['Meetings', 'Horse Form'], source: 'AtTheRaces.com' },
                    ].map((item) => (
                        <div key={item.sport} className="p-5 rounded-2xl border bg-card/40 backdrop-blur-sm space-y-4 hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{item.icon}</span>
                                <Badge variant="outline" className="text-[9px] font-mono">{item.source}</Badge>
                            </div>
                            <div>
                                <h4 className="font-black italic text-sm uppercase tracking-tight">{item.sport}</h4>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {item.elements.map(el => (
                                        <span key={el} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">{el}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
