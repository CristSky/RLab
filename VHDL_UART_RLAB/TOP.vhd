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
-- Create Date:    20:08:18 08/12/2016
-- Module Name:    UART_RLAB - RLAB
-- Project Name: Laboratório Remoto
-- Description: TOP Level de teste e exemplo do módulo de comunicaçao com o Laboratório Remoto
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
entity TOP is
generic (
    g_CLKS_POR_BIT : integer := 868 -- Para o correto funcionamento configure este valor de acordo comm as instruções acima.
    );
    Port (
		clk : in  STD_LOGIC;
		Tx: out STD_LOGIC;
		Rx: in STD_LOGIC;
		Led : out std_logic_vector(7 downto 0);
		seg : out  STD_LOGIC_Vector (7 downto 0);
		an : out  STD_LOGIC_VECTOR (3 downto 0)
	);
end TOP;

architecture RLAB of TOP is

-- Componente UART_RLAB -----------------------------------------
component UART_RLAB is
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
end component;
-----------------------------------------------------------------

signal srst : STD_LOGIC := '0';
signal sswd_e : STD_LOGIC;
signal sdin_e : STD_LOGIC;
signal sdout_e : STD_LOGIC;
signal sdin : STD_LOGIC_VECTOR (7 downto 0);
signal sdout : STD_LOGIC_VECTOR (7 downto 0);
signal sswd : STD_LOGIC_VECTOR (15 downto 0);

signal sdout_aux : STD_LOGIC_VECTOR (7 downto 0);
signal tx_send_ce : STD_LOGIC := '1';

signal count: integer range 0 to 10000001;
signal display : STD_LOGIC_VECTOR (7 downto 0);

begin
-- instância UART_RLAB ------------------------------------------
INST_UART_RLAB : UART_RLAB
	generic map (g_CLKS_POR_BIT)
	port map (clk, srst, sswd_e, sswd, sdin_e, sdin, sdout_e, sdout, Tx, Rx);
-----------------------------------------------------------------

an <= "1110";

process(clk, srst, sswd_e, sdin_e) begin


if srst = '1' then
	Led <= (others => '0');
	display <= (others => '0');
	seg <= (others => '1');

elsif rising_edge(clk) then

	if sdin_e = '1' then
--		Led <= sdin;
		display <= sdin;


		if tx_send_ce = '1' then
			tx_send_ce <= '0';
			sdout_e <= '1';
			sdout_aux <= sdin(7 downto 4) & std_logic_vector(to_unsigned(to_integer(unsigned( sdin(3 downto 0) )) + 1, 4));
		else
			sdout_e <= '0';
		end if;

	elsif sswd_e = '1' then
		Led <= sswd(7 downto 0);

	else
		tx_send_ce <= '1';
		sdout_e <= '0';
	end if;


	count <= count + 1;
	if(count >= 10000) then
		count <= 0;

		case display is
			when "00110000" => seg <="11000000"; --0
			when "00110001" => seg <="11111001"; --1
			when "00110010" => seg <="00100100"; --2
			when "00110011" => seg <="00110000"; --3
			when "00110100" => seg <="10011001"; --4
			when "00110101" => seg <="10010010"; --5
			when "00110110" => seg <="10000010"; --6
			when "00110111" => seg <="11111000"; --7
			when "00111000" => seg <="10000000"; --8
			when "00111001" => seg <="10011000"; --9
			when "01100001" => seg <="10001000"; --a
			when "01000001" => seg <="10001000"; --A
			when "01100010" => seg <="10000011"; --b
			when "01000010" => seg <="10000011"; --B
			when "01100011" => seg <="11000110"; --c
			when "01000011" => seg <="11000110"; --C
			when "01100100" => seg <="10100001"; --d
			when "01000100" => seg <="10100001"; --D
			when "01100101" => seg <="10000110"; --e
			when "01000101" => seg <="10000110"; --E
			when "01100110" => seg <="10001110"; --f
			when "01000110" => seg <="10001110"; --F
			when others => seg <= "11111111";
		end case;

	end if;
end if;

end process;

sdout <= sdout_aux;


end RLAB;