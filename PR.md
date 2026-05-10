# Product reqiurement

- This is Tinder interface
- Each profile is a hackthon team
- You swipe right who would like to win until there is only one team left 
- In profile, there is what they are working on, team behind (linkedIn profile), and likeleyhood of winning compared with others teams and judges personlaity
- We also have a data set of hackthon judge and market data (external web scrapping) for the insghts of likeyhood of winning.
- Three metric for the likelyhood of winning: comparing with other teams, is it aligned with what judge needs, what would it look like if we deploy this to real world (marketablity)
- In profile, we also show visual cue of what team is about
- After event group chat - linked

# Tech
- Collecting team idea and linkedIn profile
- Build a data set per team as an agent
- Crossing all the data point to have an analysis of likeliyhood of winning

# Interface
- Swipe 
- Collecting data
- Winner - betting dashboard (who bet on what)
- Agentic dashboard - relationship
- Account

# Data entry form
- Paricipents (project description, team name, linkedIn profile, Track - category, Insights - why they are working on it)
- Judge (linkedin profile)and Competition requirement 

# Theme
- white backgounrd
- black text
- orange #F97316

# Parameters
- Overall winnerbilty
- Competitivness among other participents: compare with other participents and reason why they can win
- Likelyhood of judge picking the winner: see who are the judge and see if they will pick
- Marketblity: is what they are trying to do have a market and scale big?

# Tehc stack role 

MongoDB/Prisma
→ raw team submissions
→ hackathon judges
→ judging criteria
→ cached final scores for UI

Apify
→ scrape public LinkedIn/profile data
→ scrape judge linkedin pages
→ scrape market/competitor pages

Nia
→ deep judge/market research

Hyperspell
→ memory/evidence layer
→ stores cleaned Apify output, Nia findings, judge KB, market KB, team evidence

Agents
→ read Hyperspell
→ score competitiveness, judge fit, marketability
→ write final scores back to MongoDB