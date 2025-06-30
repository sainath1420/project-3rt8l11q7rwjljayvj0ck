import os
from typing import Dict, Any, List, Optional
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.input_file import InputFile
from appwrite.id import ID
from appwrite.query import Query
from datetime import datetime

class AppwriteService:
    def __init__(self):
        self.client = Client()
        self.account = None
        self.databases = None
        self.storage = None
        
        # Configuration
        self.endpoint = os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
        self.project_id = os.getenv("APPWRITE_PROJECT_ID")
        self.api_key = os.getenv("APPWRITE_API_KEY")
        self.database_id = os.getenv("APPWRITE_DATABASE_ID", "competeiq")
        
        # Collection IDs
        self.companies_collection_id = "companies"
        self.analyses_collection_id = "analyses"
        self.marketing_assets_collection_id = "marketing_assets"
        self.sessions_collection_id = "sessions"

    async def initialize(self):
        """Initialize Appwrite client and services"""
        try:
            # Check if required environment variables are set
            if not self.project_id:
                raise Exception("APPWRITE_PROJECT_ID environment variable is not set")
            if not self.api_key:
                raise Exception("APPWRITE_API_KEY environment variable is not set")
            
            self.client.set_endpoint(self.endpoint)
            self.client.set_project(self.project_id)
            self.client.set_key(self.api_key)
            
            self.account = Account(self.client)
            self.databases = Databases(self.client)
            self.storage = Storage(self.client)
            
            # Create collections if they don't exist
            await self._ensure_collections_exist()
            
            print("Appwrite service initialized successfully")
            
        except Exception as e:
            print(f"Failed to initialize Appwrite service: {e}")
            raise

    async def _ensure_collections_exist(self):
        """Ensure all required collections exist"""
        try:
            # Check if database exists, create if not
            try:
                self.databases.get(self.database_id)
                print(f"Database '{self.database_id}' already exists")
            except Exception as e:
                if "Database not found" in str(e) or "not found" in str(e).lower():
                    print(f"Creating database '{self.database_id}'...")
                    self.databases.create(
                        database_id=self.database_id,
                        name="CompeteIQ Database"
                    )
                else:
                    print(f"Error checking database: {e}")
                    raise
            
            # Create collections with proper schemas
            collections = [
                {
                    "id": self.companies_collection_id,
                    "name": "Companies",
                    "attributes": [
                        {"key": "name", "type": "string", "required": True},
                        {"key": "website_url", "type": "string", "required": True},
                        {"key": "product_description", "type": "string", "required": True},
                        {"key": "market_category", "type": "string", "required": True},
                        {"key": "analysis_status", "type": "string", "default": "pending"},
                        {"key": "scraped_data", "type": "string"},
                        {"key": "user_id", "type": "string", "required": True}
                    ]
                },
                {
                    "id": self.analyses_collection_id,
                    "name": "Analyses",
                    "attributes": [
                        {"key": "company_id", "type": "string", "required": True},
                        {"key": "user_id", "type": "string", "required": True},
                        {"key": "competitors", "type": "string"},
                        {"key": "market_trends", "type": "string"},
                        {"key": "market_gaps", "type": "string"},
                        {"key": "positioning_strategy", "type": "string"},
                        {"key": "competitive_advantages", "type": "string"},
                        {"key": "status", "type": "string", "default": "pending"}
                    ]
                },
                {
                    "id": self.marketing_assets_collection_id,
                    "name": "Marketing Assets",
                    "attributes": [
                        {"key": "company_id", "type": "string", "required": True},
                        {"key": "analysis_id", "type": "string", "required": True},
                        {"key": "user_id", "type": "string", "required": True},
                        {"key": "script_content", "type": "string"},
                        {"key": "audio_url", "type": "string"},
                        {"key": "images", "type": "string"},
                        {"key": "duration", "type": "integer", "default": 30},
                        {"key": "style", "type": "string"},
                        {"key": "status", "type": "string", "default": "pending"}
                    ]
                },
                {
                    "id": self.sessions_collection_id,
                    "name": "Sessions",
                    "attributes": [
                        {"key": "session_name", "type": "string", "required": True},
                        {"key": "company_data", "type": "string"},
                        {"key": "analysis_data", "type": "string"},
                        {"key": "app_state", "type": "string", "required": True},
                        {"key": "last_accessed", "type": "string", "required": True},
                        {"key": "is_active", "type": "boolean", "default": True},
                        {"key": "user_id", "type": "string", "required": True}
                    ]
                }
            ]
            
            for collection in collections:
                try:
                    # First, try to get the collection
                    existing_collection = self.databases.get_collection(self.database_id, collection["id"])
                    print(f"Collection '{collection['id']}' already exists")
                    
                    # Check if all required attributes exist
                    existing_attrs = self.databases.list_attributes(
                        database_id=self.database_id,
                        collection_id=collection["id"]
                    )
                    existing_attr_keys = {attr['key'] for attr in existing_attrs['attributes']}
                    
                    # Add any missing attributes
                    for attr in collection["attributes"]:
                        if attr["key"] not in existing_attr_keys:
                            try:
                                if attr["type"] == "string":
                                    self.databases.create_string_attribute(
                                        database_id=self.database_id,
                                        collection_id=collection["id"],
                                        key=attr["key"],
                                        size=255,  # Default size for string attributes
                                        required=attr.get("required", False),
                                        default=attr.get("default")
                                    )
                                    print(f"Added string attribute '{attr['key']}' to collection '{collection['id']}'")
                                elif attr["type"] == "integer":
                                    self.databases.create_integer_attribute(
                                        database_id=self.database_id,
                                        collection_id=collection["id"],
                                        key=attr["key"],
                                        required=attr.get("required", False),
                                        default=attr.get("default")
                                    )
                                    print(f"Added integer attribute '{attr['key']}' to collection '{collection['id']}'")
                                elif attr["type"] == "boolean":
                                    self.databases.create_boolean_attribute(
                                        database_id=self.database_id,
                                        collection_id=collection["id"],
                                        key=attr["key"],
                                        required=attr.get("required", False),
                                        default=attr.get("default")
                                    )
                                    print(f"Added boolean attribute '{attr['key']}' to collection '{collection['id']}'")
                            except Exception as e:
                                print(f"Failed to add attribute {attr['key']} to collection {collection['id']}: {e}")
                    
                except Exception as e:
                    if "Collection with the requested ID could not be found" in str(e) or "not found" in str(e).lower():
                        print(f"Creating collection '{collection['id']}'...")
                        # Create collection first
                        self.databases.create_collection(
                            database_id=self.database_id,
                            collection_id=collection["id"],
                            name=collection["name"]
                        )
                        
                        # Then add attributes one by one
                        for attr in collection["attributes"]:
                            try:
                                if attr["type"] == "string":
                                    self.databases.create_string_attribute(
                                        database_id=self.database_id,
                                        collection_id=collection["id"],
                                        key=attr["key"],
                                        size=255,  # Default size for string attributes
                                        required=attr.get("required", False),
                                        default=attr.get("default")
                                    )
                                    print(f"Created string attribute '{attr['key']}'")
                                elif attr["type"] == "integer":
                                    self.databases.create_integer_attribute(
                                        database_id=self.database_id,
                                        collection_id=collection["id"],
                                        key=attr["key"],
                                        required=attr.get("required", False),
                                        default=attr.get("default")
                                    )
                                    print(f"Created integer attribute '{attr['key']}'")
                                elif attr["type"] == "boolean":
                                    self.databases.create_boolean_attribute(
                                        database_id=self.database_id,
                                        collection_id=collection["id"],
                                        key=attr["key"],
                                        required=attr.get("required", False),
                                        default=attr.get("default")
                                    )
                                    print(f"Created boolean attribute '{attr['key']}'")
                            except Exception as attr_error:
                                print(f"Failed to create attribute {attr['key']}: {attr_error}")
                    else:
                        print(f"Error checking collection {collection['id']}: {e}")
                        raise
            
            print("All collections and attributes verified successfully")
                            
        except Exception as e:
            print(f"Failed to ensure collections exist: {e}")
            raise

    # Authentication methods
    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login user with email and password"""
        try:
            session = self.account.create_email_session(email, password)
            return session
        except Exception as e:
            raise Exception(f"Login failed: {str(e)}")

    async def logout(self):
        """Logout current user"""
        try:
            self.account.delete_sessions()
        except Exception as e:
            raise Exception(f"Logout failed: {str(e)}")

    async def get_current_user(self) -> Optional[Dict[str, Any]]:
        """Get current authenticated user"""
        try:
            user = self.account.get()
            return user
        except Exception as e:
            return None

    async def register(self, email: str, password: str, name: str) -> Dict[str, Any]:
        """Register new user"""
        try:
            user = self.account.create(
                user_id=ID.unique(),
                email=email,
                password=password,
                name=name
            )
            return user
        except Exception as e:
            raise Exception(f"Registration failed: {str(e)}")

    # Company methods
    async def create_company(self, company_id: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new company document"""
        try:
            # Try to create with user_id first
            document = self.databases.create_document(
                database_id=self.database_id,
                collection_id=self.companies_collection_id,
                document_id=company_id,
                data=company_data
            )
            return document
        except Exception as e:
            print(f"Failed to create company with user_id, trying without: {e}")
            # If that fails, try without user_id (for cases where schema doesn't have user_id)
            try:
                company_data_without_user = {k: v for k, v in company_data.items() if k != 'user_id'}
                document = self.databases.create_document(
                    database_id=self.database_id,
                    collection_id=self.companies_collection_id,
                    document_id=company_id,
                    data=company_data_without_user
                )
                return document
            except Exception as e2:
                print(f"Failed to create company document: {e2}")
                raise Exception(f"Could not create company document: {e2}")

    async def get_company(self, company_id: str) -> Optional[Dict[str, Any]]:
        """Get company by ID"""
        try:
            return self.databases.get_document(
                database_id=self.database_id,
                collection_id=self.companies_collection_id,
                document_id=company_id
            )
        except Exception as e:
            return None

    async def update_company(self, company_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update company record"""
        try:
            return self.databases.update_document(
                database_id=self.database_id,
                collection_id=self.companies_collection_id,
                document_id=company_id,
                data=updates
            )
        except Exception as e:
            raise Exception(f"Failed to update company: {str(e)}")

    # Analysis methods
    async def create_analysis(self, analysis_id: str, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new analysis document"""
        try:
            # Try to create with user_id first
            document = self.databases.create_document(
                database_id=self.database_id,
                collection_id=self.analyses_collection_id,
                document_id=analysis_id,
                data=analysis_data
            )
            return document
        except Exception as e:
            print(f"Failed to create analysis with user_id, trying without: {e}")
            # If that fails, try without user_id (for cases where schema doesn't have user_id)
            try:
                analysis_data_without_user = {k: v for k, v in analysis_data.items() if k != 'user_id'}
                document = self.databases.create_document(
                    database_id=self.database_id,
                    collection_id=self.analyses_collection_id,
                    document_id=analysis_id,
                    data=analysis_data_without_user
                )
                return document
            except Exception as e2:
                print(f"Failed to create analysis document: {e2}")
                raise Exception(f"Could not create analysis document: {e2}")

    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Get analysis by ID"""
        try:
            return self.databases.get_document(
                database_id=self.database_id,
                collection_id=self.analyses_collection_id,
                document_id=analysis_id
            )
        except Exception as e:
            return None

    async def update_analysis(self, analysis_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update analysis record"""
        try:
            return self.databases.update_document(
                database_id=self.database_id,
                collection_id=self.analyses_collection_id,
                document_id=analysis_id,
                data=updates
            )
        except Exception as e:
            raise Exception(f"Failed to update analysis: {str(e)}")

    async def get_user_analyses(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all analyses for a user"""
        try:
            response = self.databases.list_documents(
                database_id=self.database_id,
                collection_id=self.analyses_collection_id,
                queries=[Query.equal("user_id", user_id)],
                limit=limit
            )
            return response.get("documents", [])
        except Exception as e:
            print(f"Failed to get user analyses: {e}")
            return []

    # Marketing Assets methods
    async def create_marketing_asset(self, asset_id: str, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new marketing asset record"""
        try:
            return self.databases.create_document(
                database_id=self.database_id,
                collection_id=self.marketing_assets_collection_id,
                document_id=asset_id,
                data=asset_data
            )
        except Exception as e:
            raise Exception(f"Failed to create marketing asset: {str(e)}")

    async def get_marketing_asset(self, asset_id: str) -> Optional[Dict[str, Any]]:
        """Get marketing asset by ID"""
        try:
            return self.databases.get_document(
                database_id=self.database_id,
                collection_id=self.marketing_assets_collection_id,
                document_id=asset_id
            )
        except Exception as e:
            return None

    async def update_marketing_asset(self, asset_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update marketing asset record"""
        try:
            return self.databases.update_document(
                database_id=self.database_id,
                collection_id=self.marketing_assets_collection_id,
                document_id=asset_id,
                data=updates
            )
        except Exception as e:
            raise Exception(f"Failed to update marketing asset: {str(e)}")

    # Session methods
    async def create_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new session record"""
        try:
            return self.databases.create_document(
                database_id=self.database_id,
                collection_id=self.sessions_collection_id,
                document_id=ID.unique(),
                data=session_data
            )
        except Exception as e:
            raise Exception(f"Failed to create session: {str(e)}")

    async def get_user_sessions(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all sessions for a user"""
        try:
            # Try to query with user_id first
            response = self.databases.list_documents(
                database_id=self.database_id,
                collection_id=self.sessions_collection_id,
                queries=[
                    Query.equal("user_id", user_id),
                    Query.order_desc("last_accessed")
                ],
                limit=limit
            )
            return response.get("documents", [])
        except Exception as e:
            print(f"Failed to get user sessions with user_id, trying without: {e}")
            # If that fails, try without user_id filter
            try:
                response = self.databases.list_documents(
                    database_id=self.database_id,
                    collection_id=self.sessions_collection_id,
                    queries=[
                        Query.order_desc("last_accessed")
                    ],
                    limit=limit
                )
                return response.get("documents", [])
            except Exception as e2:
                print(f"Failed to get user sessions: {e2}")
                return []

    async def get_active_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the active session for a user"""
        try:
            # Try to query with user_id first
            sessions = self.databases.list_documents(
                database_id=self.database_id,
                collection_id=self.sessions_collection_id,
                queries=[
                    Query.equal("user_id", user_id),
                    Query.equal("is_active", True),
                    Query.order_desc("last_accessed"),
                    Query.limit(1)
                ]
            )
            if sessions.documents:
                return sessions.documents[0]
        except Exception as e:
            print(f"Failed to get active session with user_id, trying without: {e}")
            # If that fails, try without user_id filter
            try:
                sessions = self.databases.list_documents(
                    database_id=self.database_id,
                    collection_id=self.sessions_collection_id,
                    queries=[
                        Query.equal("is_active", True),
                        Query.order_desc("last_accessed"),
                        Query.limit(1)
                    ]
                )
                if sessions.documents:
                    return sessions.documents[0]
            except Exception as e2:
                print(f"Failed to get active session: {e2}")
        return None

    async def update_session(self, session_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update session record"""
        try:
            return self.databases.update_document(
                database_id=self.database_id,
                collection_id=self.sessions_collection_id,
                document_id=session_id,
                data=updates
            )
        except Exception as e:
            raise Exception(f"Failed to update session: {str(e)}")

    async def set_active_session(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Set a session as active and deactivate others"""
        try:
            # Deactivate all other sessions for this user
            response = self.databases.list_documents(
                database_id=self.database_id,
                collection_id=self.sessions_collection_id,
                queries=[Query.equal("user_id", user_id)]
            )
            
            for doc in response.get("documents", []):
                if doc["$id"] != session_id:
                    self.databases.update_document(
                        database_id=self.database_id,
                        collection_id=self.sessions_collection_id,
                        document_id=doc["$id"],
                        data={"is_active": False}
                    )
            
            # Activate the specified session
            return self.databases.update_document(
                database_id=self.database_id,
                collection_id=self.sessions_collection_id,
                document_id=session_id,
                data={"is_active": True}
            )
        except Exception as e:
            raise Exception(f"Failed to set active session: {str(e)}") 