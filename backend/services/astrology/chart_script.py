import plotly.graph_objects as go
import json

# Data from the provided JSON
data = {"Year":["2024","2025","2029"],"MarketSize":[3.94,4.75,9.91]}

# Create the bar chart with deep purple bars
fig = go.Figure(data=[
    go.Bar(
        x=data["Year"],
        y=data["MarketSize"],
        marker_color='#4B0082',  # Deep purple color
        text=[f'${val:.2f}b' for val in data["MarketSize"]],
        textposition='outside',
        cliponaxis=False
    )
])

# Update layout with mid-gray axes
fig.update_layout(
    title="Global Astrology App Market Size (2024–2029)",
    xaxis_title="Year",
    yaxis_title="Market Size ($b)",
    showlegend=False
)

# Update axes to mid-gray color and ensure x-axis is categorical
fig.update_xaxes(
    type='category',
    color='#808080',  # Mid-gray color
    linecolor='#808080',
    tickcolor='#808080'
)

fig.update_yaxes(
    ticksuffix="b",
    color='#808080',  # Mid-gray color
    linecolor='#808080',
    tickcolor='#808080'
)

# Save the chart
fig.write_image("astrology_market_chart.png")