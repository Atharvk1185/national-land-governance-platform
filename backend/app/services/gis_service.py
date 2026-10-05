"""
GIS Service Layer for National Land Governance Platform.
Provides:
1. GeoJSON boundaries for Indian States and Key Districts
2. Multi-temporal Land Use / Land Cover (LULC) layers (2015 vs 2025)
3. Climate & Disaster Hazard Layers (Flood, Drought, Heat)
4. Land Dispute Hotspot Density Map
5. Spatial Measurement & Land-Use Change Difference Engine
"""

import math
import json
from typing import Dict, Any, List, Optional
from backend.app.utils.seed_data import STATE_INDICATORS, DEMO_DISCLAIMER

# Approximate representative boundary coordinates for major Indian states & regions for interactive GIS
STATE_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "id": "MH",
            "properties": {
                "name": "Maharashtra",
                "code": "MH",
                "capital": "Mumbai",
                "agri_pct_2015": 61.2,
                "agri_pct_2025": 56.4,
                "urban_pct_2015": 8.4,
                "urban_pct_2025": 11.2,
                "forest_pct_2015": 20.8,
                "forest_pct_2025": 20.1,
                "water_pct_2015": 3.9,
                "water_pct_2025": 3.8,
                "disputes_total": 94200,
                "climate_risk": 72.4,
                "bhu_aadhaar_coverage": "88.6%"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [72.8, 18.9], [73.5, 20.2], [75.2, 21.4], [78.6, 21.6],
                    [80.5, 21.3], [80.3, 19.5], [78.2, 18.8], [76.4, 17.5],
                    [73.8, 15.8], [73.3, 17.0], [72.8, 18.9]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "KA",
            "properties": {
                "name": "Karnataka",
                "code": "KA",
                "capital": "Bengaluru",
                "agri_pct_2015": 58.6,
                "agri_pct_2025": 54.8,
                "urban_pct_2015": 8.1,
                "urban_pct_2025": 10.8,
                "forest_pct_2015": 21.9,
                "forest_pct_2025": 21.4,
                "water_pct_2015": 4.2,
                "water_pct_2025": 4.1,
                "disputes_total": 78100,
                "climate_risk": 68.2,
                "bhu_aadhaar_coverage": "91.2%"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [74.1, 14.8], [75.2, 17.5], [77.5, 18.1], [77.7, 15.2],
                    [78.4, 13.6], [77.5, 12.0], [75.8, 11.9], [74.8, 13.2],
                    [74.1, 14.8]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "UP",
            "properties": {
                "name": "Uttar Pradesh",
                "code": "UP",
                "capital": "Lucknow",
                "agri_pct_2015": 72.8,
                "agri_pct_2025": 68.2,
                "urban_pct_2015": 9.2,
                "urban_pct_2025": 12.5,
                "forest_pct_2015": 7.1,
                "forest_pct_2025": 6.8,
                "water_pct_2015": 4.6,
                "water_pct_2025": 4.5,
                "disputes_total": 142000,
                "climate_risk": 69.8,
                "bhu_aadhaar_coverage": "84.1%"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [77.4, 28.6], [79.2, 29.8], [82.5, 28.5], [84.4, 27.2],
                    [84.1, 24.5], [82.8, 24.2], [79.8, 25.1], [78.1, 27.4],
                    [77.4, 28.6]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "OD",
            "properties": {
                "name": "Odisha",
                "code": "OD",
                "capital": "Bhubaneswar",
                "agri_pct_2015": 45.2,
                "agri_pct_2025": 42.1,
                "urban_pct_2015": 4.8,
                "urban_pct_2025": 6.4,
                "forest_pct_2015": 38.2,
                "forest_pct_2025": 37.3,
                "water_pct_2015": 6.4,
                "water_pct_2025": 6.2,
                "disputes_total": 52100,
                "climate_risk": 82.5,
                "bhu_aadhaar_coverage": "86.4%"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [84.5, 21.8], [86.8, 21.9], [87.1, 20.8], [85.8, 19.5],
                    [84.8, 18.8], [82.8, 18.2], [82.5, 20.2], [84.5, 21.8]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "GJ",
            "properties": {
                "name": "Gujarat",
                "code": "GJ",
                "capital": "Gandhinagar",
                "agri_pct_2015": 55.6,
                "agri_pct_2025": 52.3,
                "urban_pct_2015": 11.8,
                "urban_pct_2025": 14.1,
                "forest_pct_2015": 11.2,
                "forest_pct_2025": 11.0,
                "water_pct_2015": 4.3,
                "water_pct_2025": 4.2,
                "disputes_total": 61200,
                "climate_risk": 71.0,
                "bhu_aadhaar_coverage": "93.8%"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [68.5, 23.5], [71.2, 24.6], [73.5, 24.1], [74.2, 22.0],
                    [73.1, 20.5], [71.5, 20.8], [69.2, 22.2], [68.5, 23.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "TN",
            "properties": {
                "name": "Tamil Nadu",
                "code": "TN",
                "capital": "Chennai",
                "agri_pct_2015": 52.1,
                "agri_pct_2025": 48.5,
                "urban_pct_2015": 12.8,
                "urban_pct_2025": 15.6,
                "forest_pct_2015": 20.5,
                "forest_pct_2025": 20.3,
                "water_pct_2015": 5.1,
                "water_pct_2025": 4.9,
                "disputes_total": 69400,
                "climate_risk": 74.2,
                "bhu_aadhaar_coverage": "92.4%"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [80.2, 13.1], [79.8, 11.8], [79.2, 10.3], [77.5, 8.1],
                    [76.8, 10.2], [77.2, 12.1], [79.1, 13.2], [80.2, 13.1]
                ]]
            }
        }
    ]
}

# Major Hotspot Points (Parcels, Expressways, Corridors)
INFRASTRUCTURE_CORRIDORS = [
    {
        "name": "Delhi-Mumbai Industrial Corridor (DMIC)",
        "coordinates": [[77.2, 28.6], [75.8, 26.9], [72.5, 23.0], [72.8, 19.0]],
        "status": "Operational & Expanding",
        "affected_hectares": 125000
    },
    {
        "name": "Mumbai-Pune Expressway Peri-Urban Corridor",
        "coordinates": [[72.8, 18.9], [73.2, 18.8], [73.8, 18.5]],
        "status": "High Urban Sprawl Pressure",
        "affected_hectares": 38000
    },
    {
        "name": "Bengaluru-Chennai High-Speed Infrastructure Spine",
        "coordinates": [[77.5, 12.9], [78.8, 12.9], [80.2, 13.0]],
        "status": "Active Land Acquisition",
        "affected_hectares": 24500
    }
]

class GISService:
    """Provides spatial querying, land-use change detection, and geospatial metadata."""

    def get_layers_manifest(self) -> List[Dict[str, Any]]:
        return [
            {"id": "boundaries", "name": "State & Administrative Boundaries", "type": "vector", "default_visible": True, "opacity": 0.8},
            {"id": "land_use", "name": "Land Use / Land Cover (Cropland, Forest, Built-up)", "type": "choropleth", "default_visible": True, "opacity": 0.75},
            {"id": "urban_sprawl", "name": "Urban Expansion & Peri-Urban Corridors", "type": "vector_line", "default_visible": False, "opacity": 0.85},
            {"id": "climate_risk", "name": "Climate Vulnerability Index (Flood & Drought)", "type": "heatmap", "default_visible": False, "opacity": 0.65},
            {"id": "dispute_density", "name": "Judicial Dispute Density Hotspots", "type": "heatmap", "default_visible": False, "opacity": 0.70},
            {"id": "bhu_aadhaar", "name": "Bhu-Aadhaar ULPIN Cadastral Parcels (Sample)", "type": "vector_polygon", "default_visible": False, "opacity": 0.9}
        ]

    def get_state_geojson(self) -> Dict[str, Any]:
        return STATE_GEOJSON

    def get_corridors_geojson(self) -> Dict[str, Any]:
        features = []
        for c in INFRASTRUCTURE_CORRIDORS:
            features.append({
                "type": "Feature",
                "properties": {
                    "name": c["name"],
                    "status": c["status"],
                    "affected_hectares": c["affected_hectares"]
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": c["coordinates"]
                }
            })
        return {"type": "FeatureCollection", "features": features}

    def analyze_land_use_change(self, state_name: str, year_start: int = 2015, year_end: int = 2025) -> Dict[str, Any]:
        """
        Calculates multi-temporal land use shifts, percentage deltas, and generates AI spatial interpretation.
        """
        state_data = STATE_INDICATORS.get(state_name) or STATE_INDICATORS["Maharashtra"]
        total_area = state_data["land_area_sqkm"]

        # Synthetic multi-temporal shift dynamics
        agri_start = state_data["agricultural_pct"] + (2.5 if year_start < 2020 else 0)
        agri_end = state_data["agricultural_pct"] - (1.2 if year_end > 2022 else 0)
        urban_start = max(3.0, state_data["urban_pct"] - 3.2)
        urban_end = state_data["urban_pct"]
        forest_start = state_data["forest_pct"] + 0.6
        forest_end = state_data["forest_pct"]
        water_start = state_data["water_bodies_pct"] + 0.2
        water_end = state_data["water_bodies_pct"]

        agri_diff = round(agri_end - agri_start, 2)
        urban_diff = round(urban_end - urban_start, 2)
        forest_diff = round(forest_end - forest_start, 2)
        water_diff = round(water_end - water_start, 2)

        # Hectare calculations (1 sq km = 100 hectares)
        urban_growth_ha = int(abs(urban_diff) / 100.0 * total_area * 100)
        agri_loss_ha = int(abs(agri_diff) / 100.0 * total_area * 100)

        ai_interpretation = (
            f"Spatial multi-temporal analysis for {state_name} between {year_start} and {year_end} reveals an accelerated "
            f"urban land expansion of {urban_diff:+0.1f}% (approx. {urban_growth_ha:,} hectares). "
            f"This has primarily encroached upon prime agricultural lands, which experienced a net shrinkage of {agri_diff:+0.1f}% "
            f"({agri_loss_ha:,} hectares), concentrated predominantly along major transit expressways and peri-urban municipal peripheries. "
            f"Forest canopy cover showed a subtle change of {forest_diff:+0.1f}%, while wetland and surface water indices contracted by {water_diff:+0.1f}%. "
            f"Recommendation: Institute statutory agricultural protection belts and mandatory 500m eco-sensitive buffer zones around surface waterbodies."
        )

        return {
            "state": state_name,
            "year_start": year_start,
            "year_end": year_end,
            "total_land_area_sqkm": total_area,
            "breakdown": {
                "agricultural": {"start_pct": agri_start, "end_pct": agri_end, "delta_pct": agri_diff, "delta_label": f"{agri_diff:+0.1f}%"},
                "urban_built_up": {"start_pct": urban_start, "end_pct": urban_end, "delta_pct": urban_diff, "delta_label": f"{urban_diff:+0.1f}%"},
                "forest": {"start_pct": forest_start, "end_pct": forest_end, "delta_pct": forest_diff, "delta_label": f"{forest_diff:+0.1f}%"},
                "water_bodies": {"start_pct": water_start, "end_pct": water_end, "delta_pct": water_diff, "delta_label": f"{water_diff:+0.1f}%"}
            },
            "metrics": {
                "urban_expansion_ha": urban_growth_ha,
                "agricultural_net_change_ha": agri_loss_ha,
                "satellite_sensor": "Sentinel-2 / LISS-IV 10m Multi-Spectral Blend",
                "confidence_score": 0.91
            },
            "ai_interpretation": ai_interpretation,
            "disclaimer": DEMO_DISCLAIMER
        }

    @staticmethod
    def calculate_haversine_distance(coord1: List[float], coord2: List[float]) -> float:
        """Calculates spherical distance in kilometers between two [lon, lat] points."""
        lon1, lat1 = coord1
        lon2, lat2 = coord2
        r = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(r * c, 2)

gis_service = GISService()
