----------------------------------------------------------------------------------
-- Trabalho de Curso apresentado ao Curso de Bacharelado em Ciência da Computação
-- da Fundação de Ensino "Eurípedes Soares da Rocha",
-- mantenedora do Centro Universitário Eurípedes de Marília - UNIVEM
--
-- Autor: Cristiano Vicente
-- Orientador: Prof. Dr. Fábio Dacêncio Pereira
--
-- Titulo do trabalho: LABORATÓRIO REMOTO PARA PROTOTIPAÇÃO DE CIRCUITOS DIGITAIS UTILIZANDO FPGAS DA FAMÍLIA XILINX SPARTAN-6
--
-- Module Name:    UART_RLAB - RLAB
--
-- Project Name: Laboratório Remoto
-- Description: Modulo que instancia os receptor e transmissor e os controla, fornecendo uma UART completa RX-TX,
-- este modulo também é responsavel por receber e reconhecer os comandos enviados pelo servidor do Laboratório Remoto
--
--
-- Revision: 1.0
--
----------------------------------------------------------------------------------
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.numeric_std.all;
--
-- Para configuraçao de CLOCK:
-- g_CLKS_POR_BIT = (Frequecia de Clock)/(Frequecia da UART)
-- Exemplo: 100 MHz Clock, 115200 baud UART
-- (100000000)/(115200) = 868
--
entity UART_RLAB is
generic (
    g_CLKS_POR_BIT : INTEGER
    );
    Port (
		 clk : in  STD_LOGIC;
		 rst : out  STD_LOGIC;
		 swd_e : out STD_LOGIC;
		 swd : out STD_LOGIC_VECTOR(15 downto 0);
		 din_e : out STD_LOGIC;
		 din : out STD_LOGIC_VECTOR(7 downto 0);
		 dout_e : in STD_LOGIC;
		 dout : in STD_LOGIC_VECTOR(7 downto 0);
		 Tx: out STD_LOGIC;
		 Rx: in STD_LOGIC
	);

end UART_RLAB;
architecture RLAB of UART_RLAB is

-- Componente M_UART_TX -----------------------------------------
component M_UART_TX is
	generic (
		g_CLKS_POR_BIT : integer
   );
   Port (
		 i_Clk       : in  std_logic;
		 i_TX_DV     : in  std_logic;
		 i_TX_Byte   : in  std_logic_vector(7 downto 0);
		 o_TX_Active : out std_logic;
		 o_TX_Serial : out std_logic;
		 o_TX_Done   : out std_logic
	);
end component;
-----------------------------------------------------------------

-- Componente M_UART_RX -----------------------------------------
component M_UART_RX is
	generic (
		g_CLKS_POR_BIT : integer
   );
    Port (
		i_Clk       : in  std_logic;
		i_RX_Serial : in  std_logic;
		o_RX_DV     : out std_logic;
		o_RX_Byte   : out std_logic_vector(7 downto 0)
	 );
end component;
-----------------------------------------------------------------

-----------------------------------------------------------------
signal stx_e : STD_LOGIC; --tx enable
signal stx_data : std_logic_vector(7 downto 0); --tx entrada de dados
signal stx_active : std_logic; --saida mostra que tx esta enviando
signal stx_done : std_logic; --saida mostra que tx termoniou envio
signal srx_e : STD_LOGIC; -- indica que Rx recebeu dados
signal srx_data : std_logic_vector(7 downto 0); -- dados recebidos pelo Rx
-----------------------------------------------------------------

signal index : integer := 0;

type T_ESTADOS is (IDLE, FIM, CMD, SENDDIN, SENDDOUT);
signal ESTADO : T_ESTADOS := IDLE;
signal ESTADO_TX : T_ESTADOS := IDLE;

begin

-- instância M_UART_TX ------------------------------------------
INST_M_UART_TX : M_UART_TX
	generic map (g_CLKS_POR_BIT)
	port map (clk, stx_e, stx_data, stx_active, Tx, stx_done);
-----------------------------------------------------------------

-- instância M_UART_RX ------------------------------------------
INST_M_UART_RX : M_UART_RX
	generic map (g_CLKS_POR_BIT)
	port map (clk, Rx, srx_e, srx_data);
-----------------------------------------------------------------


process(clk, dout_e, stx_done, stx_active) begin

if rising_edge(clk) then

	case ESTADO_TX is
		when IDLE =>
			if dout_e = '1' then
				ESTADO_TX <= SENDDOUT;
			end if;

		when SENDDOUT =>

			if stx_done = '1' then
				ESTADO_TX <= FIM;

			elsif stx_active = '0' then
				stx_e <= '1';
				stx_data <= dout;
			else
				stx_e <= '0';
			end if;

		when FIM =>
			stx_e <= '0';
			ESTADO_TX <= IDLE;

		when others => null;
	end case;

end if;


end process;


process(clk, srx_e)
begin
if rising_edge(clk) then

	case ESTADO is
		when IDLE =>
			rst <= '0';
			din_e <= '0';
			swd_e <= '0';

			if srx_e = '1' then -- ativa quando recebe dados do Rx

				-- caso dado de entrada seja um comando
				case srx_data is
					when "10000000" => -- Switch 0x80
						swd_e <= '1';
						ESTADO <= CMD;

					when "10010000" => -- Switch 0x90
						ESTADO <= SENDDIN;

					when "10100000" => -- Reset 0xa0
						rst <= '1';
						swd <= (others => '0');
						din_e <= '0';
						din <= (others => '0');
						swd_e <= '0';
						ESTADO <= FIM;

					when others =>
						ESTADO <= IDLE;

				end case;
				--------------------------------------
			end if;


		when SENDDIN =>
			if srx_e = '1' then
				din_e <= '1';
				din <= srx_data;
				ESTADO <= FIM;
			end if;

		-- condiçao quando receber um comando
		when CMD =>

			index <= to_integer(unsigned(srx_data (3 downto 0)));
			if srx_e = '1' then

				case srx_data (7 downto 4) is
					when "0000" => -- liga
						swd(index) <= '1';
						ESTADO <= FIM;

					when "1100" => -- desliga
						swd(index) <= '0';
						ESTADO <= FIM;

					when others => null;
				end case;

			end if;


		when FIM =>
			din <= (others => '0');
			din_e <= '0';
			ESTADO <= IDLE;

		when others => null;
	end case;

end if;
end process;


end RLAB;