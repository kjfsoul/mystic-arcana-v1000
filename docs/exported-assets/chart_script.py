import plotly.graph_objects as go
import plotly.express as px
import json

# Data for the system architecture
data = {
    "title": "Community Reading Platform - System Architecture",
    "layers": [
        {
            "name": "User Layer",
            "components": ["Readers", "Moderators", "Authors", "Book Clubs"],
            "color": "#1FB8CD"
        },
        {
            "name": "Frontend Layer", 
            "components": ["Web App", "Mobile App", "Admin Dashboard", "Community Portal"],
            "color": "#FFC185"
        },
        {
            "name": "Community Features",
            "components": ["Group Reading", "Discussion Forums", "Events & Challenges", "Social Sharing", "Peer Reviews"],
            "color": "#ECEBD5"
        },
        {
            "name": "Gamification Engine",
            "components": ["Badge System", "Persona Evolution", "Progress Tracking", "Leaderboards", "Achievement Unlocks"],
            "color": "#5D878F"
        },
        {
            "name": "Content Management",
            "components": ["Book Library", "Custom Themes", "Spread Layouts", "User Content", "Reading Materials"],
            "color": "#D2BA4C"
        },
        {
            "name": "Analytics & AI",
            "components": ["Reading Analytics", "Recommendation Engine", "Behavior Insights", "Personalization", "ML Models"],
            "color": "#B4413C"
        },
        {
            "name": "Backend Services",
            "components": ["User Management", "Authentication", "Content Delivery", "Notification Service", "Event Processing"],
            "color": "#964325"
        },
        {
            "name": "Data Layer",
            "components": ["User Database", "Reading Data", "Community Data", "Analytics Warehouse", "Content Storage"],
            "color": "#944454"
        }
    ]
}

# Prepare data for sunburst chart
ids = []
labels = []
parents = []
values = []
colors = []

# Add root
ids.append("Platform")
labels.append("Reading Platform")
parents.append("")
values.append(1)
colors.append("#13343B")

# Add layers and components
for layer in data["layers"]:
    layer_name = layer["name"]
    layer_color = layer["color"]
    
    # Add layer
    ids.append(layer_name)
    labels.append(layer_name[:15])  # Truncate to 15 chars
    parents.append("Platform")
    values.append(1)
    colors.append(layer_color)
    
    # Add components
    for component in layer["components"]:
        component_id = f"{layer_name}_{component}"
        ids.append(component_id)
        labels.append(component[:15])  # Truncate to 15 chars
        parents.append(layer_name)
        values.append(1)
        colors.append(layer_color)

# Create sunburst chart
fig = go.Figure(go.Sunburst(
    ids=ids,
    labels=labels,
    parents=parents,
    values=values,
    branchvalues="total",
    marker=dict(
        colors=colors,
        line=dict(color="white", width=2)
    ),
    hovertemplate='<b>%{label}</b><br>Layer: %{parent}<extra></extra>',
    maxdepth=3
))

fig.update_layout(
    title="Community Reading Platform Architecture",
    font_size=12,
    uniformtext_minsize=10,
    uniformtext_mode='hide'
)

# Save the chart
fig.write_image("architecture_diagram.png")