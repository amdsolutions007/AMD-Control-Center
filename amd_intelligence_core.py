"""
AMD INTELLIGENCE CORE
=====================

Universal OpenAI integration layer that floats across all projects.
Every job, task, and operation trains the AI from A to Z.

Features:
- Logs all operations with context
- Trains OpenAI on success/failure patterns
- Provides intelligent recommendations
- Builds institutional knowledge base
- Auto-documents workflows

Usage:
    from amd_intelligence_core import AMDIntelligence
    
    ai = AMDIntelligence()
    ai.log_operation("social_post", {"platform": "facebook", "result": "success"})
    recommendation = ai.get_recommendation("lead_generation")
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
import openai
from pathlib import Path

# Initialize OpenAI (Railway will provide this via env var)
openai.api_key = os.getenv('OPENAI_API_KEY')

class AMDIntelligence:
    """
    Central Intelligence System for AMD Operations
    
    Logs every operation, trains on patterns, provides recommendations.
    """
    
    def __init__(self, knowledge_base_path: str = "amd_knowledge_base.json"):
        self.knowledge_base_path = Path(knowledge_base_path)
        self.knowledge_base = self._load_knowledge_base()
        self.model = "gpt-4"  # Use GPT-4 for best reasoning
        
    def _load_knowledge_base(self) -> Dict:
        """Load existing knowledge base or create new one"""
        if self.knowledge_base_path.exists():
            with open(self.knowledge_base_path, 'r') as f:
                return json.load(f)
        return {
            "operations": [],
            "patterns": {},
            "optimizations": [],
            "failures": [],
            "created_at": datetime.now().isoformat()
        }
    
    def _save_knowledge_base(self):
        """Persist knowledge base to disk"""
        with open(self.knowledge_base_path, 'w') as f:
            json.dump(self.knowledge_base, f, indent=2)
    
    def log_operation(
        self,
        operation_type: str,
        data: Dict[str, Any],
        result: str = "success",
        metadata: Optional[Dict] = None
    ):
        """
        Log an operation for AI learning
        
        Args:
            operation_type: Type of operation (e.g., "social_post", "lead_scrape")
            data: Operation data and parameters
            result: "success" or "failure"
            metadata: Additional context
        """
        operation = {
            "timestamp": datetime.now().isoformat(),
            "type": operation_type,
            "data": data,
            "result": result,
            "metadata": metadata or {}
        }
        
        # Add to knowledge base
        self.knowledge_base["operations"].append(operation)
        
        # Track failures for analysis
        if result == "failure":
            self.knowledge_base["failures"].append(operation)
        
        # Save periodically (every 10 operations)
        if len(self.knowledge_base["operations"]) % 10 == 0:
            self._save_knowledge_base()
        
        # Train AI on this operation
        self._train_on_operation(operation)
    
    def _train_on_operation(self, operation: Dict):
        """
        Train OpenAI on this operation using Assistant API
        
        This builds up the AI's understanding of your workflows.
        """
        try:
            # Create a training prompt
            training_context = f"""
            AMD Solutions Operation Logged:
            Type: {operation['type']}
            Result: {operation['result']}
            Data: {json.dumps(operation['data'], indent=2)}
            Timestamp: {operation['timestamp']}
            
            Learn from this operation and understand the workflow patterns.
            """
            
            # Send to OpenAI for learning (using chat completion)
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are AMD Intelligence Core, learning from every operation to optimize business workflows."
                    },
                    {
                        "role": "user",
                        "content": training_context
                    }
                ],
                max_tokens=150
            )
            
            # Store AI's understanding
            insight = response.choices[0].message.content
            operation["ai_insight"] = insight
            
        except Exception as e:
            print(f"⚠️ AI Training Error: {e}")
    
    def get_recommendation(
        self,
        operation_type: str,
        context: Optional[Dict] = None
    ) -> str:
        """
        Get AI recommendation based on learned patterns
        
        Args:
            operation_type: Type of operation needing recommendation
            context: Current context/parameters
            
        Returns:
            AI-generated recommendation
        """
        # Gather relevant historical data
        relevant_ops = [
            op for op in self.knowledge_base["operations"]
            if op["type"] == operation_type
        ][-20:]  # Last 20 similar operations
        
        # Build context for AI
        prompt = f"""
        Based on AMD Solutions' historical data, provide a recommendation for:
        
        Operation Type: {operation_type}
        Current Context: {json.dumps(context or {}, indent=2)}
        
        Historical Performance (last 20 operations):
        {json.dumps(relevant_ops, indent=2)}
        
        Provide:
        1. Recommended approach
        2. Potential pitfalls to avoid
        3. Expected success rate based on patterns
        """
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are AMD Intelligence Core with deep knowledge of AMD Solutions' operations. Provide actionable recommendations."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"⚠️ Unable to generate recommendation: {e}"
    
    def analyze_patterns(self) -> Dict[str, Any]:
        """
        Analyze patterns across all operations
        
        Returns:
            Pattern analysis and optimization suggestions
        """
        total_ops = len(self.knowledge_base["operations"])
        failures = len(self.knowledge_base["failures"])
        success_rate = ((total_ops - failures) / total_ops * 100) if total_ops > 0 else 0
        
        # Group by operation type
        by_type = {}
        for op in self.knowledge_base["operations"]:
            op_type = op["type"]
            if op_type not in by_type:
                by_type[op_type] = {"total": 0, "failures": 0}
            by_type[op_type]["total"] += 1
            if op["result"] == "failure":
                by_type[op_type]["failures"] += 1
        
        # Calculate success rates by type
        for op_type, stats in by_type.items():
            stats["success_rate"] = (
                (stats["total"] - stats["failures"]) / stats["total"] * 100
            )
        
        # Ask AI for insights
        prompt = f"""
        Analyze these operation patterns and provide optimization recommendations:
        
        Total Operations: {total_ops}
        Overall Success Rate: {success_rate:.2f}%
        
        By Type:
        {json.dumps(by_type, indent=2)}
        
        Recent Failures:
        {json.dumps(self.knowledge_base["failures"][-10:], indent=2)}
        
        Provide:
        1. Key patterns identified
        2. Areas needing improvement
        3. Specific optimization recommendations
        """
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are AMD Intelligence Core analyzing operational patterns to optimize business performance."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=800
            )
            
            ai_analysis = response.choices[0].message.content
            
        except Exception as e:
            ai_analysis = f"⚠️ Analysis error: {e}"
        
        return {
            "total_operations": total_ops,
            "overall_success_rate": success_rate,
            "by_type": by_type,
            "ai_analysis": ai_analysis,
            "generated_at": datetime.now().isoformat()
        }
    
    def export_knowledge(self, format: str = "json") -> str:
        """
        Export learned knowledge for backup or transfer
        
        Args:
            format: "json" or "markdown"
            
        Returns:
            Formatted knowledge export
        """
        if format == "json":
            return json.dumps(self.knowledge_base, indent=2)
        
        elif format == "markdown":
            md = f"""# AMD Intelligence Core - Knowledge Export

Generated: {datetime.now().isoformat()}

## Statistics
- Total Operations: {len(self.knowledge_base['operations'])}
- Total Failures: {len(self.knowledge_base['failures'])}
- Knowledge Base Created: {self.knowledge_base['created_at']}

## Recent Operations
"""
            for op in self.knowledge_base['operations'][-10:]:
                md += f"\n### {op['type']} - {op['result'].upper()}\n"
                md += f"**Time:** {op['timestamp']}\n"
                md += f"**Data:** ```json\n{json.dumps(op['data'], indent=2)}\n```\n"
            
            return md


# Global instance for easy access
intelligence = AMDIntelligence()


# Convenience functions for quick access
def log(operation_type: str, data: Dict, result: str = "success", **kwargs):
    """Quick log function"""
    intelligence.log_operation(operation_type, data, result, kwargs)

def recommend(operation_type: str, context: Optional[Dict] = None) -> str:
    """Quick recommendation function"""
    return intelligence.get_recommendation(operation_type, context)

def analyze() -> Dict:
    """Quick analysis function"""
    return intelligence.analyze_patterns()
