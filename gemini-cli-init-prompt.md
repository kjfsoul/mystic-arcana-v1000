gemini run agent-setup --goals "Install a_mem, CrewAI, agentic memory logger" \
--preserve claude.md gemini.md README.md .env.local FRD.md FRS.md \
--steps "Check for missing files > Install deps > Bootstrap memory triggers > Confirm agent roles" \
--log-to a_mem \
--on-complete "Mark session onboarding complete in claude.md"

echo 'pm2 start mystic-agents/strategic_agent_loop.py --interpreter python3 --name agentic-loop' > crew_agent_runner.sh
chmod +x crew_agent_runner.sh
