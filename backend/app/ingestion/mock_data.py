import json
import os
from typing import List, Tuple
from app.api.schemas import ResearchPaper, Patent

def generate_mock_datasets() -> Tuple[List[ResearchPaper], List[Patent]]:
    papers = [
        ResearchPaper(
            paper_id="PAPER-001",
            title="Graph Neural Networks for Explainable Molecular Substructure Alignment in Drug Affinity Prediction",
            abstract="Predicting drug-target binding affinity remains a challenge due to poor explainability of deep representations. We present GNN-Affinity, using spatial graph attention to model molecular binding sites. While improving MSE by 14%, current GNN architectures fail when protein 3D conformational dynamics shift under body temperature.",
            authors=["Elena Rostova", "Marcus Chen", "David Kim"],
            publication_year=2024,
            doi="10.1016/j.jmgm.2024.108200",
            keywords=["Graph Neural Networks", "Drug-Target Affinity", "Molecular Structure", "Explainable AI"],
            source_url="https://doi.org/10.1016/j.jmgm.2024.108200",
            references=["PAPER-002", "PAPER-005"],
            source_provider="Semantic Scholar Mock",
            dataset_version="1.0.0"
        ),
        ResearchPaper(
            paper_id="PAPER-002",
            title="Transformer Attention Mechanisms in Protein-Ligand Interaction Benchmarks",
            abstract="Transformer encoders capture long-range token sequences representing amino acid chains. However, self-attention maps struggle to represent 3D geometric spatial constraints, leading to false-positive affinity scores on dynamic binding pockets.",
            authors=["Sarah Jenkins", "Arjun Patel"],
            publication_year=2023,
            doi="10.1021/acs.jcim.3c00123",
            keywords=["Transformers", "Protein Binding", "Self-Attention", "Geometric Deep Learning"],
            source_url="https://doi.org/10.1021/acs.jcim.3c00123",
            references=[],
            source_provider="Semantic Scholar Mock",
            dataset_version="1.0.0"
        ),
        ResearchPaper(
            paper_id="PAPER-003",
            title="Quantum-Inspired Hybrid Neural Embeddings for High-Throughput Virtual Screening",
            abstract="High-throughput screening suffers from exponential chemical space exploration limits. We propose quantum variational feature maps for molecule vectorization, achieving 3x speedup. A major limitation is high sensitivity to quantum gate noise on non-cryogenic NISQ hardware.",
            authors=["Kenji Sato", "Laura Vance"],
            publication_year=2024,
            doi="10.1038/s41598-024-51201-y",
            keywords=["Quantum ML", "Virtual Screening", "Molecular Embeddings"],
            source_url="https://doi.org/10.1038/s41598-024-51201-y",
            references=["PAPER-001"],
            source_provider="OpenAlex Mock",
            dataset_version="1.0.0"
        ),
        ResearchPaper(
            paper_id="PAPER-004",
            title="Cross-Modal Knowledge Graphs for Biomedical Entity Resolution and Patent Prior-Art Identification",
            abstract="Integrating patent specifications with scientific literature using heterogeneous knowledge graphs enables cross-corpus linkage. Graph embeddings identify hidden technical equivalences, though resolution degrades when processing OCR text from legacy patent claims.",
            authors=["Amara Diallo", "Robert Miller"],
            publication_year=2023,
            doi="10.1093/bioinformatics/btad412",
            keywords=["Knowledge Graphs", "Entity Resolution", "Prior Art", "Patent Mining"],
            source_url="https://doi.org/10.1093/bioinformatics/btad412",
            references=["PATENT-001"],
            source_provider="OpenAlex Mock",
            dataset_version="1.0.0"
        ),
        ResearchPaper(
            paper_id="PAPER-005",
            title="Contrastive Multimodal Representation Learning for Genomic-Phenomic Target Discovery",
            abstract="Joint learning across single-cell RNA transcriptomics and clinical phenotypes identifies novel drug target candidates. However, model inference requires paired multi-omic data which is sparse in rare disease cohorts.",
            authors=["Xiao Zhang", "Hannah Smith"],
            publication_year=2024,
            doi="10.1038/s41587-024-02100-x",
            keywords=["Multimodal Learning", "Genomics", "Contrastive Learning", "Target Discovery"],
            source_url="https://doi.org/10.1038/s41587-024-02100-x",
            references=[],
            source_provider="Semantic Scholar Mock",
            dataset_version="1.0.0"
        )
    ]

    patents = [
        Patent(
            patent_id="PATENT-001",
            application_id="US17/890,123",
            title="System and Method for Automated Molecular Substructure Affinity Scoring Using Dynamic Spatial Graphs",
            abstract="A computerized system configured to execute dynamic 3D graph convolution on ligand-protein receptor complexes to calculate binding affinity energy state vectors for pharmaceutical optimization.",
            claims=[
                "1. A computing method comprising: receiving 3D structural coordinate data of a protein ligand pair; constructing an adaptive spatial graph; applying message-passing graph operations to derive a binding energy score.",
                "2. The method of claim 1, wherein spatial graphs update nodes dynamically at 100-femtosecond resolution.",
                "3. The system of claim 1, wherein binding energy predictions exclude thermal fluctuation variance above 310 Kelvin."
            ],
            description="The present invention provides automated binding energy evaluation using spatial graph networks. However, current embodiments require pre-calculated static protein crystal structures and fail when ligand flexibility exceeds 12 rotatable bonds.",
            publication_date="2023-11-14",
            classifications=["G16B 15/00", "G16B 40/00", "C12Q 1/68"],
            assignee="BioTech Innovations Corp",
            citations=["PAPER-001", "PATENT-002"],
            source_url="https://patents.google.com/patent/US11842801B2/en",
            source_provider="Google Patents Mock",
            dataset_version="1.0.0"
        ),
        Patent(
            patent_id="PATENT-002",
            application_id="US18/102,456",
            title="Real-Time Transformer-Assisted Ligand Pose Optimization in Cryo-EM Density Maps",
            abstract="An apparatus using vision transformers to fit molecular structures into cryo-electron microscopy electron density maps for rapid computational drug screening.",
            claims=[
                "1. An image processing system comprising: a camera array; a GPU memory storing cryo-EM map grids; a multi-head attention neural network calculating electron density fit vectors.",
                "2. The apparatus of claim 1, wherein ligand pose scoring is limited to rigid-body transformations."
            ],
            description="Embodiments describe rapid fitting of small molecules into cryo-EM maps. A key limitation is that flexible side-chain conformations are not modeled, resulting in misaligned hydrogen bonding predictions.",
            publication_date="2024-02-20",
            classifications=["G16B 20/00", "G06T 7/00"],
            assignee="CryoStructure Technologies Inc",
            citations=["PAPER-002"],
            source_url="https://patents.google.com/patent/US11900122B1/en",
            source_provider="PatentsView Mock",
            dataset_version="1.0.0"
        ),
        Patent(
            patent_id="PATENT-003",
            application_id="EP3982109A1",
            title="Quantum-Classical Hybrid Circuit for Combinatorial Molecular Docking Search",
            abstract="A quantum computing device and classical pre-processor for optimizing molecular conformation binding states using variational quantum eigensolvers.",
            claims=[
                "1. A hybrid computing system for molecular docking comprising a classical front-end for initial candidate filtering and a quantum processor executing parameterized circuit iterations."
            ],
            description="Discloses hybrid quantum-classical docking. The system faces coherence decay when molecule size exceeds 50 heavy atoms.",
            publication_date="2023-08-09",
            classifications=["G06N 10/00", "G16C 20/00"],
            assignee="Quantum Pharma Labs Ltd",
            citations=["PAPER-003"],
            source_url="https://patents.google.com/patent/EP3982109A1/en",
            source_provider="EPO Mock",
            dataset_version="1.0.0"
        ),
        Patent(
            patent_id="PATENT-004",
            application_id="US17/654,987",
            title="Cross-Corpus Knowledge Graph Extraction and Prior-Art Alert Engine",
            abstract="A enterprise software framework for continuously mapping research publications against published patent claims to calculate real-time freedom-to-operate indicators.",
            claims=[
                "1. An automated text analysis system comprising a crawler, a relation extraction NLP engine, and a prior-art distance visualizer."
            ],
            description="The framework correlates technical keywords and entity graphs. A reported drawback is high false-positive overlap metrics when domain taxonomies differ between WIPO and arXiv classifications.",
            publication_date="2023-05-18",
            classifications=["G06F 16/93", "G06Q 50/18"],
            assignee="IP Analytics Global Inc",
            citations=["PAPER-004"],
            source_url="https://patents.google.com/patent/US11651120B2/en",
            source_provider="Google Patents Mock",
            dataset_version="1.0.0"
        )
    ]

    return papers, patents

def save_fixtures(target_dir: str):
    os.makedirs(target_dir, exist_ok=True)
    papers, patents = generate_mock_datasets()
    
    papers_path = os.path.join(target_dir, "papers.json")
    patents_path = os.path.join(target_dir, "patents.json")
    
    with open(papers_path, "w", encoding="utf-8") as f:
        json.dump([p.model_dump() for p in papers], f, indent=2)
        
    with open(patents_path, "w", encoding="utf-8") as f:
        json.dump([p.model_dump() for p in patents], f, indent=2)
        
    return papers_path, patents_path
