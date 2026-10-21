# Mechanistic Lens holds no Hub-computed data — it's a feed of community-reported Findings

ADR-0001 had the Hub precompute a canonical activation/attribution map per Model for the Mechanistic Lens, which the community would annotate node-by-node. We reversed this: the Hub computes nothing for the Mechanistic Lens. Instead it's a feed of self-contained Mechanistic Findings, each reported by a researcher who ran their own interpretability method elsewhere — their own choice of subset/circuit, in their own terms, naming the phenomenon it detects or controls.

**Why:** a real Model has hundreds of millions of parameters — far too many to render as a usable clickable map — and every interpretability method produces its own, generally incommensurable, notion of "circuit" anyway (there's no shared basis to index nodes against across researchers or methods). Forcing findings onto one Hub-drawn map would have misrepresented how this research actually gets done and added a large, pointless precompute/visualization subsystem.

**Considered options:** keep ADR-0001's shared map and require Findings to reference nodes on it — rejected, since it doesn't match how real circuit-discovery findings are produced. A hybrid (keep the map for casual exploration, Findings decoupled from it) was also considered and rejected as unneeded complexity once the map itself lost its purpose.
