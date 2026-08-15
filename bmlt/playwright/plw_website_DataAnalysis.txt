from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import pandas as pd


def analyse_page(url):

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=False
        )

        page = browser.new_page(
            viewport={"width":1600,"height":900}
        )

        print("Opening:", url)

        page.goto(
            url,
            wait_until="networkidle",
            timeout=60000
        )

        html = page.content()

        browser.close()

    soup = BeautifulSoup(html,"html.parser")

    print("="*70)
    print("PAGE TITLE")
    print("="*70)

    print(soup.title.text if soup.title else "No title")

    print()

    ##########################################################
    # TABLES
    ##########################################################

    tables = pd.read_html(html)

    print("Tables found :",len(tables))

    for i,table in enumerate(tables):

        print()

        print("="*70)
        print("TABLE",i+1)
        print("="*70)

        print(table.head())

    ##########################################################
    # HEADINGS
    ##########################################################

    headings=[]

    for tag in soup.find_all(
        ["h1","h2","h3"]
    ):

        headings.append(
            tag.get_text(
                " ",
                strip=True
            )
        )

    print()

    print("="*70)
    print("HEADINGS")
    print("="*70)

    for h in headings:

        print(h)

    ##########################################################
    # LINKS
    ##########################################################

    links=[]

    for a in soup.find_all("a",href=True):

        links.append(a["href"])

    print()

    print("Links :",len(links))

    ##########################################################
    # IMAGES
    ##########################################################

    images=soup.find_all("img")

    print("Images :",len(images))

    ##########################################################
    # PAGE TEXT
    ##########################################################

    text=soup.get_text(
        "\n",
        strip=True
    )

    print()

    print("="*70)
    print("FIRST 2000 CHARACTERS")
    print("="*70)

    print(text[:2000])


if __name__=="__main__":

    url=input("Enter URL : ").strip()

    analyse_page(url)