#!/usr/bin/env python3
"""
Ghost Writer Pro - Local Testing Script
Tests content generation, graphic creation, and queue management
"""

import os
import sys
from content_generator import ContentGenerator
from graphic_generator import GraphicGenerator

def test_content_generation():
    """Test 1: Content Generator"""
    print("\n" + "=" * 80)
    print("TEST 1: CONTENT GENERATOR")
    print("=" * 80)
    
    try:
        gen = ContentGenerator()
        post = gen.generate_next_post()
        
        print(f"\n✅ Generated Post:")
        print(f"   State: {post['state_name']}")
        print(f"   Day: {post.get('day', 'N/A')}/36")
        print(f"   Hashtags: {len(post['hashtags'])} tags")
        print(f"\n📝 Caption Preview (first 200 chars):")
        print(f"   {post['caption'][:200]}...")
        
        return True
    except Exception as e:
        print(f"\n❌ Content Generation Failed: {e}")
        return False


def test_graphic_generation():
    """Test 2: Graphic Generator"""
    print("\n" + "=" * 80)
    print("TEST 2: GRAPHIC GENERATOR")
    print("=" * 80)
    
    try:
        gen = GraphicGenerator()
        filepath = gen.generate_state_graphic("Lagos", 1)
        
        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath) / 1024  # KB
            print(f"\n✅ Graphic Generated:")
            print(f"   Path: {filepath}")
            print(f"   Size: {file_size:.1f} KB")
            print(f"   Format: PNG (1200x675px)")
            return True
        else:
            print(f"\n❌ Graphic file not found: {filepath}")
            return False
    except Exception as e:
        print(f"\n❌ Graphic Generation Failed: {e}")
        return False


def test_queue_directories():
    """Test 3: Queue Directory Structure"""
    print("\n" + "=" * 80)
    print("TEST 3: QUEUE DIRECTORIES")
    print("=" * 80)
    
    required_dirs = [
        "pending_posts",
        "approved_posts",
        "rejected_posts",
        "posted_archive",
        "generated_graphics"
    ]
    
    all_exist = True
    for dir_name in required_dirs:
        exists = os.path.exists(dir_name)
        status = "✅" if exists else "❌"
        print(f"\n{status} {dir_name}/")
        
        if not exists:
            all_exist = False
            print(f"   Creating directory...")
            os.makedirs(dir_name)
    
    return all_exist


def test_environment_variables():
    """Test 4: Environment Variables"""
    print("\n" + "=" * 80)
    print("TEST 4: ENVIRONMENT VARIABLES")
    print("=" * 80)
    
    required_vars = {
        "TELEGRAM_BOT_TOKEN": "Telegram Bot (from @BotFather)",
        "CEO_TELEGRAM_ID": "CEO Telegram User ID (from @userinfobot)",
        "LEKE_LEKE_EMAIL": "Leke Leke Login Email",
        "LEKE_LEKE_PASSWORD": "Leke Leke Password"
    }
    
    optional_vars = {
        "GEMINI_API_KEY": "Google Gemini API (for future image gen)"
    }
    
    all_set = True
    
    print("\n🔑 Required Variables:")
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            masked = value[:4] + "*" * (len(value) - 8) + value[-4:] if len(value) > 8 else "***"
            print(f"   ✅ {var}: {masked}")
        else:
            print(f"   ❌ {var}: NOT SET ({description})")
            all_set = False
    
    print("\n🔑 Optional Variables:")
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            masked = value[:4] + "*" * (len(value) - 8) + value[-4:] if len(value) > 8 else "***"
            print(f"   ✅ {var}: {masked}")
        else:
            print(f"   ⚠️  {var}: NOT SET ({description})")
    
    return all_set


def test_data_files():
    """Test 5: Data Files"""
    print("\n" + "=" * 80)
    print("TEST 5: DATA FILES")
    print("=" * 80)
    
    required_files = [
        "36_states_data.json",
        "content_generator.py",
        "graphic_generator.py",
        "telegram_approval_bot.py",
        "leke_leke_browser_automation.py"
    ]
    
    all_exist = True
    for filename in required_files:
        exists = os.path.exists(filename)
        status = "✅" if exists else "❌"
        print(f"\n{status} {filename}")
        
        if exists:
            file_size = os.path.getsize(filename) / 1024  # KB
            print(f"   Size: {file_size:.1f} KB")
        else:
            all_exist = False
    
    return all_exist


def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("GHOST WRITER PRO - LOCAL TESTING")
    print("=" * 80)
    print("\n🔍 Running pre-deployment tests...\n")
    
    # Load .env if it exists
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Loaded .env file\n")
    except ImportError:
        print("⚠️  python-dotenv not installed (optional)\n")
    
    results = {}
    
    # Run tests
    results["Data Files"] = test_data_files()
    results["Queue Directories"] = test_queue_directories()
    results["Environment Variables"] = test_environment_variables()
    results["Content Generator"] = test_content_generation()
    results["Graphic Generator"] = test_graphic_generation()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"\n{status} - {test_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 80)
    if all_passed:
        print("✅ ALL TESTS PASSED - READY FOR DEPLOYMENT")
        print("=" * 80)
        print("\n📋 Next Steps:")
        print("   1. Fill in .env file with your credentials")
        print("   2. Test Telegram bot: python3 telegram_approval_bot.py")
        print("   3. Deploy to Railway (see DEPLOYMENT.md)")
        return 0
    else:
        print("❌ SOME TESTS FAILED - FIX ISSUES BEFORE DEPLOYING")
        print("=" * 80)
        print("\n📋 Required Actions:")
        if not results["Environment Variables"]:
            print("   1. Create .env file (copy from .env.example)")
            print("   2. Fill in TELEGRAM_BOT_TOKEN, CEO_TELEGRAM_ID, LEKE_LEKE_EMAIL, LEKE_LEKE_PASSWORD")
        if not results["Data Files"]:
            print("   3. Ensure all Python files are in the current directory")
        print("\n   Then run this test script again.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
