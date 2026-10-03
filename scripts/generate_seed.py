#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador do seed.sql do APP CARDAPIOS CACIQUE RESTAURANTE.
Fonte: os dois cardápios físicos (PDF) fornecidos pelo restaurante.
  • CAFÉ DA MANHÃ  → menu slug 'cafe-da-manha'
  • REFEIÇÕES      → menu slug 'refeicoes'
Nenhum produto, preço ou descrição é inventado: tudo vem dos PDFs.
Nota: o cardápio impresso repete alguns códigos (ex.: 1089 para
mini pastel de carne e misto; 917 no café); mantidos como no original.
"""
import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

RESTAURANT = "aaaaaaaa-0000-4000-8000-000000000001"
MENU_CAFE  = "aaaaaaaa-0000-4000-8000-000000000002"
MENU_REF   = "aaaaaaaa-0000-4000-8000-000000000003"

_uuid_seq = 0
def uid(prefix: str) -> str:
    global _uuid_seq
    _uuid_seq += 1
    return f"{prefix}-{_uuid_seq:05d}"

def esc(s: str) -> str:
    return s.replace("'", "''")

def price(p: float) -> str:
    return f"{p:.2f}"

# ---------------------------------------------------------------
# Templates de opções (do cardápio físico)
# ---------------------------------------------------------------
def opt(name, sel="single", req=True, mn=0, mx=1, values=None):
    return {"name": name, "type": sel, "req": req, "min": mn, "max": mx, "values": values or []}

FRUTAS = ["ABACATE","ABACAXI","AÇAÍ","ACEROLA","AMEIXA","CAJÁ","CAJU","MORANGO",
          "TANGERINA","LIMÃO","GOIABA","GRAVIOLA","LARANJA","MAÇÃ","MANGA",
          "MARACUJÁ","MELÃO","TAMARINDO"]

OPT_FRUTA        = opt("Fruta", values=[(f, 0.0) for f in FRUTAS])
OPT_PAO          = opt("Pão", values=[("Pão bola",0.0),("Carioca",0.0),("Pão de forma",0.0),("Pão integral",0.0)])
OPT_ACOMP_CAFE   = opt("Acompanhamento", values=[("Arroz branco",0.0),("Cuscuz",0.0)])
OPT_GUARNICOES   = opt("Guarnições", sel="multiple", mn=3, mx=3,
                        values=[("Arroz",0.0),("Baião",0.0),("Feijão",0.0),("Macarrão",0.0),("Farofa de Cuscuz",0.0),("Fritas",0.0)])
OPT_ACOMP_EXEC   = opt("Acompanhamento", values=[("Arroz + feijão + macarrão",0.0),("Baião e macarrão",0.0)])
OPT_SABOR_REFRI  = opt("Sabor", values=[(b,0.0) for b in
                        ["Coca-Cola","São Geraldo","Kuat","Guaraná","Fanta Laranja","Fanta Uva",
                         "Soda Limonada","Schweppes","Sprite","Pepsi","H2O"]])
OPT_TAM_VERDE    = opt("Tamanho", values=[("Meia",0.0),("Inteira",13.00)])
OPT_TAM_TROPICAL = opt("Tamanho", values=[("Meia",0.0),("Inteira",17.00)])

def opt_suco(dv_dupla: float):
    return opt("Frutas", values=[("Uma fruta",0.0),("Duas frutas",dv_dupla)])

# produto: (codigo, nome, descricao, tamanho, preco, [opcoes])
def P(code, name, desc=None, size=None, price=0.0, options=None):
    return {"code": code, "name": name, "desc": desc, "size": size,
            "price": price, "options": options or []}

# ===============================================================
# Blocos compartilhados (listas idênticas nos DOIS cardápios físicos)
# ===============================================================
def block_sucos_vitaminas():
    return {
        "sucos": {
            "slug": "sucos", "name": "Sucos",
            "desc": "Frutas disponíveis: abacate, abacaxi, açaí, acerola, ameixa, cajá, caju, morango, "
                    "tangerina, limão, goiaba, graviloa, laranja, maçã, manga, maracujá, melão e tamarindo.",
            "products": [
                P(None, "Suco (copo 300ml)", None, "300ml", 11.50, [OPT_FRUTA, opt_suco(1.30)]),
                P(None, "Suco (jarra 750ml)", None, "750ml", 23.80, [OPT_FRUTA, opt_suco(1.70)]),
            ],
        },
        "vitaminas": {
            "slug": "vitaminas", "name": "Vitaminas",
            "desc": "Frutas disponíveis: abacate, abacaxi, açaí, acerola, ameixa, cajá, caju, morango, "
                    "tangerina, limão, goiaba, graviloa, laranja, maçã, manga, maracujá, melão e tamarindo.",
            "products": [
                P(None, "Vitamina (copo 300ml)", None, "300ml", 12.80, [OPT_FRUTA, opt_suco(1.40)]),
                P(None, "Vitamina (jarra 750ml)", None, "750ml", 27.50, [OPT_FRUTA, opt_suco(1.50)]),
            ],
        },
    }

def block_sobremesas():
    return {
        "slug": "sobremesas-da-casa", "name": "Sobremesas da Casa",
        "desc": None,
        "products": [
            P("766", "Delícia nordestina", "Queijo coalho na chapa e mel de engenho", None, 13.50),
            P("751", "Doce de banana", None, None, 7.90),
            P("767", "Delícia do Ceará", "Ameixa de caju com sorvete de creme", None, 13.50),
            P("752", "Doce de caju em calda", None, None, 7.90),
            P("758", "Pavê de chocolate", None, None, 11.50),
            P("753", "Doce de goiaba em calda", None, None, 7.90),
            P("765", "Pavê de chocolate com castanha de caju", None, None, 13.50),
            P("754", "Doce de leite", None, None, 8.50),
            P("762", "Brownie com sorvete de creme", None, None, 15.50),
            P("755", "Doce de mamão", None, None, 7.90),
            P("770", "Brownie com castanha", None, None, 8.90),
            P("756", "Doce misto", None, None, 9.80),
            P("759", "Torta de abacaxi", None, None, 11.50),
            P("951", "Salada de fruta com sorvete", None, None, 12.50),
            P("757", "Pudim", None, None, 9.50),
            P("930", "Salada de fruta", None, None, 9.00),
            P("769", "Brownie", None, None, 7.50),
        ],
    }

def block_bolos_fatia():
    return {
        "slug": "bolos-fatia", "name": "Bolos (fatia)", "desc": None,
        "products": [
            P("1204", "Bolo Luiz Felipe", None, "Fatia", 7.50),
            P("1201", "Bolo de chocolate", None, "Fatia", 8.80),
            P("1221", "Bolo de batata doce", None, "Fatia", 9.00),
            P("1203", "Bolo de nata", None, "Fatia", 7.50),
            P("1217", "Bolo de milho cremoso", None, "Fatia", 7.50),
            P("1218", "Bolo de macaxeira", None, "Fatia", 9.00),
            P("1220", "Pé de moleque", None, "Fatia", 8.80),
        ],
    }

def block_bolos_inteiro():
    return {
        "slug": "bolos-inteiro", "name": "Bolos (inteiro)", "desc": None,
        "products": [
            P("1209", "Bolo Luiz Felipe", None, "Inteiro", 126.00),
            P("1206", "Bolo de chocolate", None, "Inteiro", 95.00),
            P("1208", "Bolo de nata", None, "Inteiro", 115.00),
            P("1207", "Bolo de milho cremoso", None, "Inteiro", 105.00),
        ],
    }

REFRI_BRANDS = ("Coca-Cola, São Geraldo, Kuat, Guaraná, Fanta Laranja, Fanta Uva, Soda Limonada, "
                "Schweppes, Sprite, Pepsi e H2O.")

def block_refrigerantes():
    return {
        "slug": "refrigerantes", "name": "Refrigerantes", "desc": "Marcos disponíveis: " + REFRI_BRANDS,
        "products": [
            P(None, "Refrigerante KS", None, "290ml", 7.90, [OPT_SABOR_REFRI]),
            P(None, "Refrigerante lata", None, "220ml", 6.50, [OPT_SABOR_REFRI]),
            P(None, "Refrigerante lata", None, "350ml", 8.50, [OPT_SABOR_REFRI]),
            P(None, "Refrigerante pet", None, "250ml", 6.50, [OPT_SABOR_REFRI]),
            P(None, "Refrigerante pet", None, "510ml", 8.50, [OPT_SABOR_REFRI]),
            P(None, "Refrigerante pet", None, "600ml", 9.50, [OPT_SABOR_REFRI]),
            P(None, "Refrigerante pet", None, "1L", 15.50, [OPT_SABOR_REFRI]),
            P(None, "Refrigerante pet", None, "2L", 22.00, [OPT_SABOR_REFRI]),
        ],
    }

def block_bebidas():
    return {
        "slug": "bebidas", "name": "Bebidas", "desc": None,
        "products": [
            P("1863", "Cajuína", None, "480ml", 7.50),
            P("1890", "Tampico", None, "330ml", 5.50),
            P("1931", "Cajuína", None, "1L", 18.50),
            P("1899", "Cappuccino (pingado, chocolate ou classic)", None, "260ml", 13.00),
            P("1896", "Del Valle", None, None, 8.50),
            P("1915", "Cappuccino Whey", None, "260ml", 15.50),
            P("1878", "Nescau", None, "280ml", 12.50),
            P("1929", "Cappuccino Prontinho", None, "250ml", 14.00),
            P("1877", "Nescau prontinho", None, "200ml", 5.50),
            P("1879", "Neston", None, "280ml", 12.50),
        ],
    }

def block_agua():
    return {
        "slug": "agua", "name": "Água", "desc": None,
        "products": [
            P("1655", "Água", None, "500ml", 4.80),
            P("1656", "Água com gás", None, "500ml", 5.80),
            P("1451", "Água tônica", None, None, 8.50),
            P("1657", "Água", None, "1,5L", 6.80),
            P("1850", "Água de coco", None, None, 5.50),
        ],
    }

def block_energeticos():
    return {
        "slug": "energeticos", "name": "Energéticos", "desc": None,
        "products": [
            P("1475", "Gatorade", None, "500ml", 13.00),
            P("1708", "Monster Zero", None, "473ml", 21.80),
            P("1703", "Red Bull", None, "250ml", 17.00),
            P("1424", "Red Bull zero", None, None, 17.80),
            P("1704", "Monster", None, "473ml", 21.00),
        ],
    }

def block_cervejas():
    return {
        "slug": "cervejas", "name": "Cervejas", "desc": None,
        "products": [
            P("1508", "Long neck Budweiser", None, "355ml", 11.00),
            P("1505", "Cerveja Heineken", None, "600ml", 24.00),
            P("1506", "Long neck Heineken", None, "330ml", 12.50),
            P("1502", "Cerveja Skol lata", None, "350ml", 7.00),
            P("1513", "Long neck Stella", None, "330ml", 12.50),
            P("1500", "Cerveja Heineken zero", None, None, 13.50),
            P("1517", "Long neck Stella", None, "600ml", 18.00),
            P("1504", "Cerveja Skol", None, "600ml", 13.90),
        ],
    }

def block_whisky():
    return [
        {
            "slug": "whisky-garrafa", "name": "Whisky (garrafa)", "desc": None,
            "products": [
                P("1560", "Black & White", None, "Garrafa", 125.00),
                P("1561", "Black Label", None, "Garrafa", 280.00),
                P("1562", "Red Label", None, "Garrafa", 151.00),
                P("1565", "Old Parr", None, "Garrafa", 250.00),
                P("1566", "White Horse", None, "Garrafa", 140.00),
            ],
        },
        {
            "slug": "whisky-dose", "name": "Whisky (dose)", "desc": None,
            "products": [
                P("1551", "Black & White", None, "Dose", 9.50),
                P("1552", "Black Label", None, "Dose", 16.50),
                P("1553", "Red Label", None, "Dose", 11.50),
                P("1556", "Old Parr", None, "Dose", 16.50),
                P("1557", "White Horse", None, "Dose", 10.50),
            ],
        },
    ]

def block_aperitivos():
    return {
        "slug": "aperitivos", "name": "Aperitivos", "desc": None,
        "products": [
            P("1801", "Campari", None, None, 6.50),
            P("1802", "Dreher", None, None, 6.50),
            P("1804", "Ron Montilla", None, None, 6.00),
            P("1803", "Vodka nacional", None, None, 6.00),
            P("1811", "Smirnoff Ice", None, "275ml", 14.50),
        ],
    }

def block_aguardente():
    return {
        "slug": "aguardente", "name": "Aguardente", "desc": None,
        "products": [P("1759", "Ypióca empalhada ouro ou prata", None, None, 5.00)],
    }

# ===============================================================
# CARDÁPIO DE CAFÉ DA MANHÃ
# ===============================================================
CAFE_REGIONAL = {
    "slug": "cafe-regional", "name": "Café Regional",
    "desc": "Acompanhamentos: arroz branco ou cuscuz. Os bifes não incluem acompanhamento.",
    "products": [
        P("016", "Galinha caipira ao molho", None, "700g", 57.00, [OPT_ACOMP_CAFE]),
        P("013", "Bife ao molho", None, "300g", 52.90),
        P("015", "Carne de sol na manteiga da terra", None, "400g", 80.50, [OPT_ACOMP_CAFE]),
        P("011", "Bife à cavalo ao molho", None, "300g", 59.90),
        P("301", "Buchada de carneiro", None, "500g", 86.50, [OPT_ACOMP_CAFE]),
        P("014", "Bife grelhado", None, "250g", 52.90),
        P("305", "Guisado de carneiro", None, "700g", 82.50, [OPT_ACOMP_CAFE]),
        P("012", "Bife acebolado ao molho", None, "300g", 54.50),
        P("009", "Panelada de carne bovina", None, "500g", 62.50, [OPT_ACOMP_CAFE]),
    ],
}

CAFE_PORCOES = {
    "slug": "porcoes", "name": "Porções", "desc": None,
    "products": [
        P("626", "Gostosinho cacique", "Cuscuz, carne moída ao molho e queijo coalho ralado", None, 15.90),
        P("920", "Ovo caipira cozido", "01 unidade", None, 6.80),
        P("911", "Cuscuz", None, "180g", 6.50),
        P("917", "Ovo frito", "01 unidade", None, 4.90),
        P("900", "Cuscuz com leite e creme de nata", None, None, 10.50),
        P("922", "Ovo caipira frito", "01 unidade", None, 6.50),
        P("899", "Cuscuz ao leite e queijo ralado", None, None, 10.50),
        P("901", "Bacon frito", None, "120g", 9.80),
        P("897", "Farofa de cuscuz com bacon e ovo", None, None, 19.50),
        P("913", "Caldo de carne bovina", None, "250ml", 9.80),
        P("923", "Pamonha", None, None, 8.50),
        P("909", "Caldo de carne bovina", None, "350ml", 13.50),
        P("907", "Canjica", None, "200g", 8.90),
        P("914", "Canja", None, "250ml", 9.80),
        P("924", "Presunto", None, "100g", 8.20),
        P("910", "Canja", None, "350ml", 13.50),
        P("929", "Queijo coalho in natura", None, "100g", 9.80),
        P("557", "Batata frita", None, "450g", 24.50),
        P("928", "Queijo coalho na chapa", None, "100g", 11.00),
        P("542", "Chips de batata doce", None, "500g", 24.50),
        P("908", "Coalhada caseira", None, "200g", 8.90),
        P("569", "Manteiga da terra", None, "35g", 4.50),
        P("607", "Manteiga", None, "35g", 5.40),
        P("898", "Creme de nata", None, "50g", 5.50),
        P("568", "Margarina", None, "35g", 3.00),
        P("570", "Macaxeira frita", None, "500g", 24.50),
    ],
}

CAFE_DA_CASA = {
    "slug": "cafe-da-casa", "name": "Café da Casa", "desc": None,
    "products": [
        P("903", "Café coado", None, "50ml", 3.80),
        P("936", "Leite com café", "Para viagem", "290ml", 8.50),
        P("902", "Café coado", None, "150ml", 4.90),
        P("912", "Leite", "Gelado ou quente", "200ml", 4.20),
        P("905", "Capuccino", None, None, 7.20),
        P("916", "Nescau quente ou gelado", None, "200ml", 8.80),
        P("906", "Capuccino com leite", None, None, 9.50),
        P("954", "Café com leite", None, "150ml", 7.00),
        P("952", "Garrafa de café", None, "250ml", 9.90),
        P("953", "Garrafa de café", None, "500ml", 14.90),
    ],
}

CAFES_ESPECIAIS = {
    "slug": "cafes-especiais", "name": "Cafés Especiais", "desc": None,
    "products": [
        P("904", "Café expresso", None, "50ml", 5.90),
        P("940", "Café macchiato", "1 cápsula de café expresso e leite vaporizado", None, 7.50),
        P("939", "Expresso latte", "2 cápsulas de café expresso e leite vaporizado", "50ml", 13.50),
        P("941", "Café canelinha", "1 cápsula de café expresso, leite vaporizado e canela em pó", None, 10.50),
        P("942", "Café mocha", "Chocolate, 1 cápsula de café expresso e leite vaporizado", "150ml", 10.50),
        P("948", "Frapê de cappuccino", None, None, 16.80),
        P("944", "Chocolate quente", None, None, 13.50),
        P("949", "Frapê de chocolate", None, None, 16.80),
        P("943", "Café panna", "Leite condensado, 1 cápsula de café expresso, leite vaporizado e chantilly", None, 10.50),
        P("946", "Chá de hibisco com essência de limão-siciliano", None, None, 15.00),
        P("950", "Chá expresso quente", None, None, 5.90),
        P("947", "Chá de cidreira com essência de limão-siciliano", None, None, 15.00),
        P("945", "Chá de hortelã com essência de maçã verde", None, None, 15.00),
        P("935", "Chá", None, "50ml", 3.50),
    ],
}

TAPIOCAS = {
    "slug": "tapiocas", "name": "Tapiocas", "desc": None,
    "products": [
        P("811", "Massa natural", None, None, 7.00),
        P("825", "Com leite de coco", None, None, 8.50),
        P("809", "Com margarina", None, None, 6.80),
        P("801", "Com amendoins", None, None, 8.90),
        P("830", "Com manteiga", None, None, 8.50),
        P("838", "Com castanha de caju", None, None, 10.00),
        P("810", "Com manteiga da terra", None, None, 8.50),
        P("826", "Crocante com coco", None, None, 9.50),
        P("814", "Com chia e linhaça", None, None, 8.80),
        P("821", "Crocante com queijo", None, None, 12.90),
        P("931", "Tapioca redonda", None, None, 4.80),
    ],
}

TAPIOCAS_DOCES = {
    "slug": "tapiocas-doces", "name": "Tapiocas Doces", "desc": None,
    "products": [
        P("877", "Banana em molho de canela", None, None, 13.10),
        P("813", "Doce de leite", None, None, 12.00),
        P("819", "Banana caramelo e queijo", None, None, 19.50),
        P("871", "Mel de engenho e queijo", None, None, 12.50),
        P("872", "Rapadura e queijo ralado", None, None, 12.90),
        P("828", "Nutella", None, None, 14.50),
        P("812", "Chocolate", None, None, 11.00),
        P("879", "Coco e banana", None, None, 10.00),
    ],
}

CREPIOCAS = {
    "slug": "crepiocas-e-crepes", "name": "Crepiocas e Crepes", "desc": None,
    "products": [
        P("836", "Crepe Fit natural", "Zero lactose e zero glúten", None, 11.50),
        P("837", "Crepe recheada", "Com tomate picado, milho verde e orégano", None, 12.70),
        P("832", "Crepioca Fit banana com canela", "Zero lactose e zero glúten", None, 14.50),
        P("833", "Crepioca recheada com queijo", "Queijo zero lactose, tomate e orégano", None, 16.70),
    ],
}

ADICIONAIS_CAFE = {
    "slug": "adicionais", "name": "Adicionais", "desc": None,
    "products": [
        P("862", "Queijo coalho na chapa", None, "70g", 7.70),
        P("856", "Frango desfiado e milho verde", None, "90g", 8.50),
        P("863", "Queijo coalho in natura", None, "70g", 6.60),
        P("875", "Filé suíno", None, "100g", 9.50),
        P("873", "Creme de nata", None, "50g", 5.50),
        P("881", "Molho especial da casa", None, "120g", 8.50),
        P("847", "Requeijão", None, "50g", 7.00),
        P("880", "Bife acebolado", None, "90g", 10.50),
        P("917", "Ovo comum", "01 unidade", None, 4.90),
        P("852", "Bife ao molho", None, "70g", 9.50),
        P("918", "Ovo caipira com bacon", "01 ovo + bacon 60g", None, 9.80),
        P("876", "Pernil de carneiro", None, "100g", 9.50),
        P("919", "Ovo comum com bacon", "01 ovo + bacon 60g", None, 8.60),
        P("864", "Salsicha em cubos ao molho de tomate", None, "90g", 7.50),
        P("870", "Calabresa acebolada", None, "60g", 7.50),
        P("800", "Carne moída ao molho", None, "120g", 12.90),
        P("851", "Bacon", None, "60g", 7.50),
        P("853", "Carne de sol", None, "50g", 13.50),
    ],
}

MASSA_SALGADA = {
    "slug": "massa-salgada", "name": "Massa Salgada", "desc": None,
    "products": [
        P("933", "Pão simples", None, None, 2.50),
        P("1054", "Croissant de carne de sol", None, None, 16.00),
        P("925", "Pão na chapa", None, None, 3.90),
        P("1055", "Croissant de frango", None, None, 16.00),
        P("1067", "Pão de queijo", None, None, 7.50),
        P("1056", "Croissant misto", None, None, 16.00),
        P("1023", "Pão na chapa com manteiga", None, None, 7.00),
        P("1057", "Croissant de queijo", None, None, 16.00),
        P("1060", "Kibe", None, None, 14.50),
        P("1068", "Pastel de carne assada", None, None, 11.50),
        P("1052", "Coxinha de frango", None, None, 11.50),
        P("1069", "Pastel de frango", None, None, 11.50),
        P("1072", "Coxinha de carne de sol com requeijão", None, None, 15.90),
        P("1070", "Pastel de queijo", None, None, 11.50),
        P("1053", "Coxinha de frango com requeijão", None, None, 13.50),
        P("1110", "Pastel de carne de sol", None, None, 13.50),
        P("1074", "Empada de carne de sol com requeijão", None, None, 13.00),
        P("1111", "Pastel misto", "Queijo e presunto", None, 12.50),
        P("1058", "Empada de frango", None, None, 10.50),
        P("1059", "Enroladinho de salsicha", None, None, 9.90),
        P("1061", "Mistinho", "Frango, queijo e presunto", None, 9.90),
    ],
}

SANDUICHES = {
    "slug": "sanduiches", "name": "Sanduíches",
    "desc": "Opções de pães: pão bola, carioca, pão de forma ou pão integral. "
            "Todos os sanduíches acompanham alface e tomate.",
    "products": [
        P("1013", "Sanduíche de ovo", "01 ovo", None, 8.00, [OPT_PAO]),
        P("1014", "Sanduíche de presunto", "Presunto 120g", None, 9.90, [OPT_PAO]),
        P("1019", "Sanduíche de pernil de carneiro", "Pernil de carneiro 100g", None, 16.00, [OPT_PAO]),
        P("1010", "Sanduíche de bife separado", "Bife ao molho 120g", None, 22.50, [OPT_PAO]),
        P("1015", "Sanduíche de queijo coalho", "Queijo coalho 70g", None, 12.00, [OPT_PAO]),
        P("1011", "Sanduíche de frango", "Filé de frango 100g", None, 15.90, [OPT_PAO]),
        P("1012", "Sanduíche de filé bovino", "Filé bovino 100g", None, 25.50, [OPT_PAO]),
        P("1007", "Hambúrguer", "Carne artesanal 100g", None, 16.90, [OPT_PAO]),
        P("1008", "Misto quente", "Queijo coalho 70g + presunto 35g", None, 13.90, [OPT_PAO]),
        P("1000", "Americano", "Carne artesanal 100g, queijo coalho 70g, presunto 35g e 01 ovo", None, 28.50, [OPT_PAO]),
        P("1001", "Bauru", "Carne artesanal 100g, queijo coalho 70g e 01 ovo", None, 26.90, [OPT_PAO]),
        P("1004", "Cheese bife", "Bife ao molho 90g e queijo coalho 70g", None, 25.50, [OPT_PAO]),
        P("1002", "Cheese bacon", "Bacon 60g e queijo coalho 70g", None, 27.50, [OPT_PAO]),
        P("1005", "Cheese frango", "Filé de frango e queijo coalho 70g", None, 21.50, [OPT_PAO]),
        P("1003", "Cheese burger", "Carne artesanal 100g e queijo coalho 70g", None, 23.50, [OPT_PAO]),
        P("1022", "Cheese filé suíno", "Filé suíno 100g e queijo coalho 70g", None, 24.90, [OPT_PAO]),
        P("1009", "Sanduíche de bife", "Bife ao molho 100g", None, 18.90, [OPT_PAO]),
        P("1006", "Cheese filé", "Filé bovino 100g e queijo coalho 70g", None, 29.50, [OPT_PAO]),
        P("1018", "Sanduíche de filé suíno", "Filé suíno 100g", None, 16.00, [OPT_PAO]),
        P("1028", "Cheese carne moída", "Carne moída ao molho 100g e queijo coalho 70g", None, 25.50, [OPT_PAO]),
        P("1025", "Sanduíche de carne de sol", "Carne de sol desfiada 50g", None, 19.50, [OPT_PAO]),
        P("1030", "Combo", "01 hambúrguer, 250g de batata frita e 10 unidades de mini coxinhas de frango", None, 32.50, [OPT_PAO]),
        P("1029", "Cheese carne de sol", "Carne de sol desfiada 50g e queijo coalho 70g", None, 23.90, [OPT_PAO]),
        P("1027", "Carne de hambúrguer", "70g", None, 12.50, [OPT_PAO]),
        P("1024", "Sanduíche de carne moída", "Carne moída ao molho 100g", None, 18.90, [OPT_PAO]),
        P("1021", "Cheese pernil de carneiro", "90g de pernil e queijo coalho 70g", None, 22.50, [OPT_PAO]),
        P("1020", "Sanduíche de ovo e bacon", "01 ovo e bacon 60g", None, 12.50, [OPT_PAO]),
    ],
}

# ===============================================================
# CARDÁPIO DE REFEIÇÕES
# ===============================================================
ENTRADAS = {
    "slug": "entradas", "name": "Entradas", "desc": None,
    "products": [
        P("1091", "Bolinhos de bacalhau", "Iguaria da cozinha portuguesa com toque especial da casa, douradas e crocantes, "
          "preparadas com bacalhau desfiado e ervas frescas.", "6 unidades", 29.00),
        P("1088", "Mini kibes", "Tradicionais kibes artesanais recheados com carne moída especial. Sequinhos, dourados e "
          "crocantes. Uma viagem sensorial ao Oriente Médio em cada mordida!", "6 unidades", 24.90),
        P("1016", "Pão de alho", "1 unidade", None, 7.50),
        P("1017", "Torrada com patê de alho", None, None, 8.50),
        P("1090", "Mini pastel de queijo", "Massa artesanal fininha e crocante com generoso recheio de queijo cremoso "
          "derretido. Perfeito para compartilhar!", "6 unidades", 15.90),
        P("572", "Coxa ou sobrecoxa de frango", None, None, 10.50),
        P("1089", "Mini pastel de carne", "Crocantes pastéis artesanais recheados com carne bovina temperada na medida "
          "certa. Uma explosão de sabor em cada mordida! O favorito dos nossos clientes.", "6 unidades", 15.90),
        P("1092", "Porção de bolinhos de carne de sol", "Bolinhos de carne de sol desfiada com massa de macaxeira.",
          "6 unidades", 16.90),
        P("1089", "Mini pastel misto", "Massa artesanal crocante e misto de queijo coalho e presunto.", "6 unidades", 15.90),
        P("616", "Linguiça mista", "Acompanha vinagrete e farofa.", "2 unidades", 16.50),
        P("567", "Linguiça mista", "Acompanha vinagrete e farofa.", None, 8.50),
    ],
}

SALADAS = {
    "slug": "saladas", "name": "Saladas", "desc": None,
    "products": [
        P("579", "Salada Verde", "Alface, repolho, milho verde, passas, pimentão, tomate, cebola, vinagre e fio de azeite.",
          None, 18.50, [OPT_TAM_VERDE]),
        P("609", "Salada Sertaneja", "Carne de sol, cubos de queijo do sertão assado, ovos, alface, melão em cubos, "
          "tomates, pimentão e cebola.", None, 41.50),
        P("665", "Salada Tropical", "Folhas frescas de alface americana, alface crespa, rúcula, azeitona preta, cubos "
          "de cenoura, fruta da estação e tiras de apresuntado em molho especial da casa.", None, 22.50, [OPT_TAM_TROPICAL]),
        P("611", "Salada de legumes em cubos salteados", "Cenoura, chuchu, ervilha, milho verde e ervas, salteados em azeite.",
          None, 25.90),
        P("556", "Salada de batatas com maionese e cenoura", None, None, 17.00),
    ],
}

MENU_SERTANEJO = {
    "slug": "menu-sertanejo", "name": "Menu Sertanejo", "desc": None,
    "products": [
        P("055", "Carne de sol na manteiga da terra",
          "Carne de sol fatiada e finalizada na manteiga de garrafa artesanal. Acompanha arroz de leite ou baião de "
          "dois à moda (com queijo de coalho e creme de nata), paçoca ou farofa de cuscuz e macaxeira à moda da casa.",
          "400g", 130.90),
        P("057", "Carne de sol sertaneja na brasa à moda",
          "Carne de sol na manteiga de garrafa intercalada com queijo do sertão e banana à milanesa. Acompanha arroz "
          "de leite ou baião à moda (com queijo de coalho e creme de nata), macaxeira à moda da casa, farofa de cuscuz "
          "e vinagrete fresco.", "400g", 120.50),
        P("522", "Escondidinho de carne de sol",
          "Camadas generosas de purê de macaxeira intercaladas com carne de sol desfiada e temperada, gratinada no "
          "forno até formar casquinha dourada. Acompanha arroz ou baião de dois e salada verde.", "400g", 109.90),
        P("053", "Bife acebolado",
          "Bife bovino ao molho, coberto com cebolas refogadas na manteiga. Acompanha arroz, feijão, farofa de "
          "cuscuz, batata frita crocante e vinagrete.", "300g", 93.50),
        P("052", "Bife a cavalo",
          "Bife bovino ao molho com ovos fritos por cima. Acompanha arroz, feijão, farofa de cuscuz, batata frita e "
          "salada verde.", "300g", 96.50),
        P("261", "Peixada sertaneja (tilápia)",
          "Peixe fresco em postas cozido ao molho de leite de coco com tomates, pimentões e coentro. Acompanha arroz "
          "branco, feijão, pirão de peixe cremoso, ovos e legumes cozidos.", "900g", 113.90),
        P("354", "Guisado de carneiro completo",
          "Carneiro cozido lentamente com batatas, cenouras, pimentão e temperos regionais até ficar macio. Molho "
          "encorpado e aromático. Acompanha arroz branco, feijão ou baião de dois, pirão cremoso ou farofa de cuscuz.",
          "700g", 91.50),
        P("351", "Buchada de carneiro",
          "Especialidade rara da culinária sertaneja. Vísceras de carneiro temperadas com coentro fresco e "
          "pimenta-do-reino, cozidas na pressão até ficarem macias. Servida com arroz branco ou baião de dois, pirão "
          "ou farofa de cuscuz.", "500g", 98.90),
        P("051", "Bife ao molho especial da casa",
          "Bife bovino de coxão mole. Acompanha arroz ou baião de dois, batata frita e salada verde.", "300g", 89.50),
        P("529", "Costelinha suína ao forno, regada com mel de engenho",
          "Costela suína assada lentamente ao forno e regada com mel de engenho, criando uma caramelização brilhante. "
          "Acompanha arroz ou baião de dois, batata frita e vinagrete.", "600g", 87.50),
        P("156", "Galinha caipira ao molho",
          "Galinha caipira cozida em ervas da região, lentamente, ao molho caseiro. Acompanha arroz ou baião de dois, "
          "farofa de cuscuz e pirão.", "700g", 79.50),
        P("352", "Costela de carneiro na brasa",
          "Costela de carneiro assada lentamente na brasa de carvão até atingir o ponto perfeito: crosta dourada por "
          "fora, carne macia e suculenta por dentro. Acompanha arroz e feijão ou baião de dois, e farofa de cuscuz.",
          "600g", 87.50),
        P("262", "Tilápia na brasa",
          "Tilápia inteira escalada, grelhada na brasa de carvão, temperada com sal grosso e ervas. Acompanha arroz e "
          "feijão ou baião de dois, batata frita e vinagrete. Porção generosa para compartilhar.", "900g", 108.90),
        P("263", "Tilápia frita",
          "Acompanha arroz e feijão ou baião de dois, macaxeira à moda ou batata frita, farofa e vinagrete.",
          "900g", 106.90),
        P("063", "Panelada",
          "Prato tradicional da culinária nordestina, feito com miúdos de boi, bucho e vísceras, cozidos em molho "
          "saboroso com tempero da região. Acompanha arroz e feijão ou baião de dois, farofa de cuscuz e vinagrete.",
          "500g", 75.50),
    ],
}

PREMIUM = {
    "slug": "selecao-premium", "name": "★ Seleção Premium do Chef", "desc": None,
    "products": [
        P("058", "Filé à parmegiana completo",
          "Filé mignon empanado artesanalmente, talharim coberto com nosso exclusivo molho de tomate ao manjericão "
          "fresco, presunto e queijo, gratinado até dourar perfeitamente. Acompanha arroz branco ou à grega, purê de "
          "batata ou batata frita e salada verde. Serve até 3 pessoas.", "400g", 144.90),
        P("509", "Espeto misto completo",
          "Explosão de sabores na brasa! Combinação irresistível de carnes: maminha, filé suíno macio, coxa e "
          "sobrecoxa de frango e linguiça mista. Tudo preparado na brasa para preservar os sucos naturais. Acompanha "
          "arroz branco e feijão ou baião de dois, macarrão ou farofa, salada verde e batata frita.", "750g", 115.90),
        P("520", "Picanha importada",
          "Corte premium importado com marmoreio excepcional, garantindo maciez incomparável e sabor intenso. Grelhada "
          "na brasa ao ponto perfeito, preservando toda a suculência. A capa de gordura derrete lentamente. "
          "Acompanha arroz branco e feijão ou baião de dois, macarrão ou farofa, salada verde e batata frita.",
          "400g", 169.00),
    ],
}

EXECUTIVOS = {
    "slug": "pratos-executivos", "name": "Pratos Executivos",
    "desc": "Escolha suas opções: arroz + feijão + macarrão ou baião e macarrão.",
    "products": [
        P("623", "Carne bovina assada", "Carne bovina selecionada, grelhada na brasa com nosso blend secreto de "
          "temperos, mantendo todo o suco e maciez natural da carne. Selada perfeitamente por fora, suculenta por "
          "dentro.", "180g", 49.00, [OPT_ACOMP_EXEC]),
        P("515", "Filé de frango a medalhão", "Medalhões de filé de peito de frango grelhados e temperados com ervas "
          "aromáticas frescas. Opção leve e saborosa, ideal para quem busca refeição equilibrada sem abrir mão do "
          "sabor.", "180g", 46.90, [OPT_ACOMP_EXEC]),
        P("662", "Baby beef ao ouro negro", "Baby beef premium grelhado e coberto com nosso exclusivo molho ouro negro "
          "— receita da casa que combina sabores defumados e aromáticos. Uma especialidade única do Cacique.",
          "200g", 52.50, [OPT_ACOMP_EXEC]),
        P("507", "Misto de carnes", "Carne bovina cozida 60g, coxa de frango 150g e uma linguiça — uma combinação "
          "equilibrada de carnes grelhadas no espeto, sabores que se complementam.", "300g", 46.90, [OPT_ACOMP_EXEC]),
        P("501", "Bife bovino ao molho ou na chapa", "Bife grelhado na chapa quente ou banhado no nosso molho especial "
          "caseiro.", "150g", 43.50, [OPT_ACOMP_EXEC]),
        P("534", "Costela suína crocante", "Costela suína assada lentamente até ficar extremamente macia por dentro, "
          "depois frita e empanada, garantindo uma crosta dourada e irresistivelmente crocante por fora.",
          "250g", 45.00, [OPT_ACOMP_EXEC]),
        P("504", "Cozido de carneiro", "Carneiro cozido lentamente na receita tradicional até ficar extremamente "
          "macio. Acompanhado com pirão de farinha de mandioca.", "280g", 46.00, [OPT_ACOMP_EXEC]),
        P("625", "Medalhão bovino", "Medalhões bovinos grelhados e temperados com ervas aromáticas frescas. Opção "
          "leve e saborosa, ideal para quem busca refeição equilibrada sem abrir mão do sabor.", "180g", 47.50,
          [OPT_ACOMP_EXEC]),
        P("502", "Bife bovino acebolado", "Bife suculento grelhado e coberto com cebolas refogadas no ponto ideal.",
          "150g", 45.50, [OPT_ACOMP_EXEC]),
        P("653", "Filé de peito de frango", "Frango empanado. Acompanha purê de batata.", "150g", 42.50, [OPT_ACOMP_EXEC]),
        P("505", "Frango ao molho", "Frango suculento coberto com molho especial da casa, finalizado com toque de "
          "ervas.", "220g", 40.50, [OPT_ACOMP_EXEC]),
        P("663", "Filé de frango com legumes", "Acompanha arroz com brócolis.", "150g", 42.50, [OPT_ACOMP_EXEC]),
        P("506", "Frango assado na brasa", "Frango temperado com blend de especiarias e assado lentamente na brasa "
          "até dourar perfeitamente.", "300g", 40.50, [OPT_ACOMP_EXEC]),
        P("657", "Steak de peixe", "Acompanha banana à milanesa.", "150g", 43.50, [OPT_ACOMP_EXEC]),
    ],
}

MENU_CLASSICO = {
    "slug": "menu-classico", "name": "Menu Clássico",
    "desc": "Pratos especiais com acompanhamentos premium selecionados pelo chef.",
    "products": [
        P("061", "Filé a medalhão", "Medalhões de filé mignon selados ao molho especial do chef, preparado com "
          "ingredientes premium cuidadosamente selecionados. Textura que derrete na boca combinada com sabor "
          "sofisticado. Servido com arroz com brócolis ou à grega, purê de batata ou batata frita e salada verde.",
          "400g", 129.90),
        P("259", "Filé de salmão na chapa ao molho de alcaparras", "Generoso filé de salmão fresco grelhado ao ponto, "
          "coberto com nosso exclusivo molho de alcaparras e ervas finas. O salmão preserva sua textura delicada e "
          "sabor marcante, enquanto as alcaparras adicionam toque cítrico único. Prato premium para paladares "
          "exigentes. Servido com arroz com brócolis ou à grega, purê de batata ou salada verde.", "370g", 153.50),
        P("059", "Filé ao molho madeira", "Filé mignon premium ao clássico molho madeira com champignon fresco "
          "salteado. A combinação perfeita entre a maciez do filé e a profundidade aromática do molho madeira "
          "autêntico da casa. Um clássico da alta gastronomia em sua mesa. Servido com arroz com brócolis ou à grega, "
          "purê de batata ou batata frita e salada verde.", "400g", 127.90),
        P("523", "Filé ao molho ouro negro", "Filé mignon ao nosso exclusivo molho ouro negro — receita do Cacique que "
          "harmoniza sabores defumados, toques aromáticos e especiarias selecionadas. Servido com arroz com brócolis "
          "ou à grega, purê de abóbora e salada verde.", "400g", 127.90),
        P("530", "Medalhão suíno à moda", "Medalhões de filé suíno e fatias de bacon com queijo coalho ao ouro negro. "
          "Servido com arroz branco ou baião de dois, purê de batata ou salada tropical de frutas e verduras.",
          "400g", 114.90),
        P("253", "Filé de peixe à delícia", "Filé passado na farinha panko, com bananas ao toque de especiarias da "
          "casa envolto em molho branco, cobertura de queijo, gratinado. Servido com arroz branco, purê de batata ou "
          "salada verde.", "370g", 105.00),
        P("153", "Filé de frango à parmegiana", "Filé de frango empanado artesanalmente, talharim coberto com nosso "
          "exclusivo molho de tomate ao manjericão fresco com presunto e queijo gratinado até dourar perfeitamente. "
          "Servido com arroz branco ou à grega, purê de batata e salada verde.", "370g", 97.50),
        P("252", "Filé de peixe na chapa", "Filé de peixe fresco grelhado na chapa ao molho de maracujá. Servido com "
          "arroz com brócolis, purê de batata ou salada verde.", "370g", 89.50),
        P("622", "Talharim à carbonara", "Talharim recheado com bacon, queijo, creme de leite, gemas de ovos e queijo "
          "gratinado ao forno.", "750g", 65.50),
    ],
}

CARNES_BRASA = {
    "slug": "carnes-na-brasa", "name": "Carnes na Brasa",
    "desc": "Carnes nobres grelhadas na brasa — escolha 3 guarnições: arroz, baião, feijão, macarrão, "
            "farofa de cuscuz ou fritas.",
    "products": [
        P("060", "Filé bovino", "O corte mais nobre e macio do boi. Filé mignon premium grelhado na brasa para "
          "realçar sua textura e sabor suave inigualável.", "400g", 119.50, [OPT_GUARNICOES]),
        P("064", "Picanha bovina nacional", "Picanha nacional cuidadosamente selecionada, com capa de gordura ideal "
          "que garante suculência incomparável. Grelhada na brasa ao ponto ou bem passada.", "400g", 116.50,
          [OPT_GUARNICOES]),
        P("361", "Maminha bovina importada", "Maminha importada premium com marmoreio excepcional. A gordura entremeada "
          "derrete durante o preparo, deixando a carne extraordinariamente macia e saborosa. Qualidade internacional.",
          "400g", 115.50, [OPT_GUARNICOES]),
        P("521", "Maminha bovina nacional", "Maminha nacional macia e saborosa, um dos cortes preferidos pelos "
          "brasileiros. Grelhada na brasa para manter os sucos naturais e intensificar o sabor característico.",
          "400g", 102.50, [OPT_GUARNICOES]),
        P("056", "Contrafilé bovino na brasa", "Contrafilé suculento, sabor intenso e textura perfeita.", "400g", 99.90,
          [OPT_GUARNICOES]),
        P("399", "Picanha suína", "Picanha suína de qualidade superior, macia e saborosa, uma alternativa deliciosa "
          "às carnes bovinas.", "400g", 92.50, [OPT_GUARNICOES]),
        P("107", "Costelinha suína na brasa", "Costelinha de suíno temperada com especiarias especiais e assada na "
          "brasa até ficar dourada e macia.", "600g", 87.50, [OPT_GUARNICOES]),
        P("151", "Espeto frango", "Coxa e sobrecoxa de frango temperadas com ervas da casa e grelhadas no espeto, "
          "mantendo toda suculência natural.", "750g", 85.90, [OPT_GUARNICOES]),
        P("451", "Filé suíno", "Filé suíno macio e suculento, grelhado na brasa. Opção leve e saborosa para quem "
          "aprecia carne suína.", "400g", 84.90, [OPT_GUARNICOES]),
        P("152", "Filé de frango na grelha ou na chapa", "Acompanha arroz branco ou arroz com brócolis e legumes "
          "salteados.", "370g", 73.50, [OPT_GUARNICOES]),
    ],
}

CARNES_PORCOES = {
    "slug": "carnes-porcoes", "name": "Carnes / Porções",
    "desc": "Perfeitas para compartilhar ou saborear sozinho!",
    "products": [
        P("013", "Bife bovino ao molho", "Generoso bife coberto com nosso molho especial da casa, equilibrando "
          "perfeitamente temperos e aromas. Favorito dos clientes!", "300g", 52.90),
        P("012", "Bife bovino acebolado", "Bife suculento apurado em molho especial e generosamente coberto com cebolas "
          "refogadas até dourar.", "300g", 54.50),
        P("661", "Bife ancho argentino", "Corte argentino nobre de sabor intenso, suculento e incrivelmente macio. "
          "Traz a tradição das parrillas argentinas para sua mesa.", "200g", 45.50),
        P("583", "Picanha importada", "Porção individual de picanha importada com marmoreio excepcional. Qualidade "
          "premium em tamanho ideal para uma pessoa.", "200g", 49.50),
        P("660", "Baby beef", "Baby beef macio e suculento, corte nobre que garante textura diferenciada e sabor "
          "suave.", "200g", 44.90),
        P("584", "Maminha bovina importada", "Maminha importada extra macia em porção individual. Qualidade "
          "internacional acessível.", "200g", 38.50),
        P("518", "Picanha nacional", "Picanha nacional de primeira qualidade em porção individual. Sabor tradicional "
          "brasileiro.", "200g", 45.50),
        P("519", "Maminha bovina nacional", "Maminha nacional macia e saborosa, escolha popular e acessível para o "
          "dia a dia.", "200g", 35.50),
        P("400", "Picanha suína", "Picanha suína de qualidade, macia e saborosa. Excelente alternativa às carnes "
          "bovinas.", "200g", 28.90),
    ],
}

PORCOES_REF = {
    "slug": "porcoes", "name": "Porções", "desc": None,
    "products": [
        P("565", "Feijão verde à moda", "Queijo coalho, creme de leite e cheiro verde.", "700g", 39.90),
        P("564", "Feijão carioca", None, "350g", 13.00),
        P("555", "Baião de dois à moda", "Feijão verde e arroz com requeijão, queijo coalho, creme de nata e cheiro "
          "verde.", "700g", 39.90),
        P("531", "Arroz de leite", "Leite, requeijão e creme de leite.", "300g", 18.50),
        P("570", "Macaxeira frita", "Receita especial da casa.", "500g", 24.50),
        P("581", "Farofa de cuscuz", "Flocos de milho cozido refogado com cebola, coentro e tomate.", "300g", 10.50),
        P("557", "Batata frita", None, "450g", 24.50),
        P("573", "Pirão", "Com farinha de mandioca.", "350g", 10.50),
        P("542", "Cubos de batata doce", None, "500g", 24.50),
        P("558", "Banana à milanesa", "01 unidade", None, 7.00),
        P("566", "Feijão verde tradicional", "Temperado com ervas frescas.", "700g", 24.50),
        P("569", "Manteiga da terra", None, "35g", 4.50),
        P("606", "Purê de macaxeira", "Feito com macaxeira in natura e leite.", "300g", 18.50),
        P("551", "Arroz branco", None, "260g", 14.90),
        P("541", "Purê de batata doce", "Feito com batata in natura.", "300g", 18.50),
        P("615", "Arroz de açafrão", None, "260g", 17.50),
        P("553", "Arroz com brócolis", None, "300g", 19.50),
        P("562", "Farinha de mandioca", None, "180g", 3.50),
        P("624", "Paçoca", "Misto de carne de sol com farinha de mandioca.", "200g", 21.50),
        P("620", "Purê de abóbora", None, "300g", 18.50),
        P("552", "Arroz à grega", None, "300g", 19.50),
        P("559", "Creme de alho", None, "300g", 6.50),
        P("574", "Purê de batata inglesa", None, "300g", 18.50),
        P("650", "Farofa de ovos", None, "100g", 9.50),
        P("554", "Baião de dois", None, "350g", 15.90),
        P("563", "Farofa", None, "100g", 4.00),
        P("571", "Macarrão", None, "260g", 13.50),
    ],
}

# ===============================================================
# Montagem dos menus
# ===============================================================
sv = block_sucos_vitaminas()

MENU_CAFE_CATEGORIES = [
    CAFE_REGIONAL, CAFE_PORCOES, CAFE_DA_CASA, CAFES_ESPECIAIS, TAPIOCAS,
    TAPIOCAS_DOCES, CREPIOCAS, ADICIONAIS_CAFE, MASSA_SALGADA, SANDUICHES,
    sv["sucos"], sv["vitaminas"], block_sobremesas(), block_bolos_fatia(),
    block_bolos_inteiro(), block_refrigerantes(), block_bebidas(), block_agua(),
    block_energeticos(), block_cervejas(),
    *block_whisky(), block_aperitivos(), block_aguardente(),
]

MENU_REF_CATEGORIES = [
    ENTRADAS, SALADAS, MENU_SERTANEJO, PREMIUM, EXECUTIVOS, MENU_CLASSICO,
    CARNES_BRASA, CARNES_PORCOES, PORCOES_REF,
    sv["sucos"], sv["vitaminas"], block_sobremesas(), block_bolos_fatia(),
    block_bolos_inteiro(), block_refrigerantes(), block_bebidas(), block_agua(),
    block_energeticos(), block_cervejas(),
    *block_whisky(), block_aperitivos(), block_aguardente(),
]

_seq = 0
def mkid(prefix: str) -> str:
    """UUID determinístico em formato válido: base fixa + contador em hexadecimal."""
    global _seq
    _seq += 1
    return f"{prefix}-{_seq:012x}"

# ===============================================================
# Geração do SQL
# ===============================================================
out = []
w = out.append

w("-- =============================================================")
w("-- APP CARDAPIOS CACIQUE RESTAURANTE — seed inicial")
w("-- Fonte: cardápios físicos do Restaurante Cacique / Cozinha Regional")
w("--   • CAFÉ DA MANHÃ  → menu 'cafe-da-manha'")
w("--   • REFEIÇÕES      → menu 'refeicoes'")
w("-- Nenhum produto, preço ou descrição é inventado; tudo vem dos PDFs.")
w("-- Nota: o cardápio impresso repete alguns códigos (ex.: 1089, 917);")
w("-- mantidos como no original.")
w("-- =============================================================")
w("")

w(f"""insert into public.restaurants (id, name, slug, active)
values ('{RESTAURANT}', 'Restaurante Cacique / Cozinha Regional', 'restaurante-cacique', true)
on conflict (slug) do update set name = excluded.name;

insert into public.menus (id, restaurant_id, slug, name, description, sort_order)
values
  ('{MENU_CAFE}', '{RESTAURANT}', 'cafe-da-manha', 'Café da Manhã', 'Cardápio de café da manhã', 1),
  ('{MENU_REF}',  '{RESTAURANT}', 'refeicoes',     'Refeições',     'Cardápio de refeições', 2)
on conflict (slug) do update set name = excluded.name;
""")

w("-- Mesas 01 a 20 (para os QR Codes /mesa/01 ... /mesa/20)")
w("insert into public.tables (number, label, active)")
w("select g.n, 'Mesa ' || lpad(g.n::text, 2, '0'), true")
w("from generate_series(1, 20) as g(n)")
w("on conflict (number) do nothing;")
w("")

TOTAL_PRODUCTS = 0
TOTAL_OPTIONS = 0
TOTAL_VALUES = 0

def emit_menu(menu_id, categories, prefix):
    global TOTAL_PRODUCTS, TOTAL_OPTIONS, TOTAL_VALUES
    for ci, cat in enumerate(categories, start=1):
        cat_id = mkid(prefix)
        cdesc = f"'{esc(cat['desc'])}'" if cat.get("desc") else "null"
        w(f"insert into public.categories (id, menu_id, slug, name, description, sort_order) values "
          f"('{cat_id}', '{menu_id}', '{esc(cat['slug'])}', '{esc(cat['name'])}', {cdesc}, {ci}) "
          f"on conflict (menu_id, slug) do update set name = excluded.name;")
        for pi, prod in enumerate(cat["products"], start=1):
            TOTAL_PRODUCTS += 1
            pid = mkid(prefix)
            code = f"'{esc(prod['code'])}'" if prod["code"] else "null"
            pdesc = f"'{esc(prod['desc'])}'" if prod["desc"] else "null"
            size = f"'{esc(prod['size'])}'" if prod["size"] else "null"
            w(f"insert into public.products (id, menu_id, category_id, code, name, description, size_label, price, active, sort_order) "
              f"values ('{pid}', '{menu_id}', '{cat_id}', {code}, '{esc(prod['name'])}', {pdesc}, {size}, "
              f"{price(prod['price'])}, true, {pi});")
            for oi, o in enumerate(prod["options"], start=1):
                TOTAL_OPTIONS += 1
                oid = mkid(prefix)
                w(f"insert into public.product_options (id, product_id, name, selection_type, required, min_select, max_select, sort_order) "
                  f"values ('{oid}', '{pid}', '{esc(o['name'])}', '{o['type']}', "
                  f"{'true' if o['req'] else 'false'}, {o['min']}, {o['max']}, {oi});")
                for vi, (vn, vp) in enumerate(o["values"], start=1):
                    TOTAL_VALUES += 1
                    vid = mkid(prefix)
                    w(f"insert into public.product_option_values (id, option_id, name, price_modifier, sort_order) "
                      f"values ('{vid}', '{oid}', '{esc(vn)}', {price(vp)}, {vi});")
        w("")

emit_menu(MENU_CAFE, MENU_CAFE_CATEGORIES, "cafe0000-0000-4000-8000")
emit_menu(MENU_REF,  MENU_REF_CATEGORIES,  "beef0000-0000-4000-8000")

w("-- Fim do seed.")
w(f"-- Total de produtos: {TOTAL_PRODUCTS} | grupos de opções: {TOTAL_OPTIONS} | valores de opções: {TOTAL_VALUES}")

# validação de formato de UUIDs gerados
import re
uuid_re = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
bad = []
for line in out:
    for u in re.findall(r"'([0-9a-f-]{36,40})'", line):
        if not uuid_re.match(u):
            bad.append(u)
if bad:
    print("UUIDs inválidos:", set(bad), file=sys.stderr)
    sys.exit(1)

with open("app-cardapios-cacique/supabase/seed.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(out) + "\n")

print(f"OK — {TOTAL_PRODUCTS} produtos, {TOTAL_OPTIONS} grupos de opções, {TOTAL_VALUES} valores gerados em seed.sql")
