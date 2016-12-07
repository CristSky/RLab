----------------------------------------------------------------------------------
--
-- Module Name:    M_UART_TX - RLAB
-- Project Name: Laboratório Remoto
--
-- Description: Este arquivo contém o Transmissor UART TX. Este transmissor é capaz de
-- transmitir 8 bits de dados em série, um bit de partida, um bit de parada,
-- e nenhum bit de paridade. Quando a transmissão estiver concluída o_TX_Done sera elevado para um ciclo de clock.
--
--
-- Autor: Russell Merrick, Disponível em: <http://www.nandland.com>
--
--
----------------------------------------------------------------------------------
--
-- Para configuraçao de CLOCK:
-- g_CLKS_POR_BIT = (Frequecia de Clock)/(Frequecia da UART)
-- Exemplo: 100 MHz Clock, 115200 baud UART
-- (100000000)/(115200) = 868
--
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity M_UART_TX is
  generic (
    g_CLKS_POR_BIT : INTEGER -- Nota: Já Configurado no TOP Level
    );
  port (
    i_Clk       : in  std_logic;
    i_TX_DV     : in  std_logic;
    i_TX_Byte   : in  std_logic_vector(7 downto 0);
    o_TX_Active : out std_logic;
    o_TX_Serial : out std_logic;
    o_TX_Done   : out std_logic
    );
end M_UART_TX;


architecture RLAB of M_UART_TX is

  type t_SM_Main is (s_Idle, s_TX_Start_Bit, s_TX_Data_Bits,
                     s_TX_Stop_Bit, s_Cleanup);
  signal r_SM_Main : t_SM_Main := s_Idle;

  signal r_Clk_Count : integer range 0 to g_CLKS_POR_BIT - 1 := 0;
  signal r_Bit_Index : integer range 0 to 7 := 0;  -- 8 Bits
  signal r_TX_Data   : std_logic_vector(7 downto 0) := (others => '0');
  signal r_TX_Done   : std_logic := '0';

begin


  p_UART_TX : process (i_Clk)
  begin
    if rising_edge(i_Clk) then

      case r_SM_Main is

        when s_Idle =>
          o_TX_Active <= '0';
          o_TX_Serial <= '1'; -- mantém a linha Tx ociósa em nivel lógico alto
          r_TX_Done   <= '0';
          r_Clk_Count <= 0;
          r_Bit_Index <= 0;

          if i_TX_DV = '1' then
            r_TX_Data <= i_TX_Byte;
            r_SM_Main <= s_TX_Start_Bit;
          else
            r_SM_Main <= s_Idle;
          end if;


        -- Envia o start bit, start bit = 0
        when s_TX_Start_Bit =>
          o_TX_Active <= '1';
          o_TX_Serial <= '0';

          -- Espera g_CLKS_POR_BIT - 1 ciclos de clock para finalizar o start bit
          if r_Clk_Count < g_CLKS_POR_BIT - 1 then
            r_Clk_Count <= r_Clk_Count + 1;
            r_SM_Main   <= s_TX_Start_Bit;
          else
            r_Clk_Count <= 0;
            r_SM_Main   <= s_TX_Data_Bits;
          end if;


        -- Espera g_CLKS_POR_BIT - 1 ciclos de clock para cada bit transmitido
        when s_TX_Data_Bits =>
          o_TX_Serial <= r_TX_Data(r_Bit_Index);

          if r_Clk_Count < g_CLKS_POR_BIT - 1 then
            r_Clk_Count <= r_Clk_Count + 1;
            r_SM_Main   <= s_TX_Data_Bits;
          else
            r_Clk_Count <= 0;

            -- Verifica se foi enviado todos os bits
            if r_Bit_Index < 7 then
              r_Bit_Index <= r_Bit_Index + 1;
              r_SM_Main   <= s_TX_Data_Bits;
            else
              r_Bit_Index <= 0;
              r_SM_Main   <= s_TX_Stop_Bit;
            end if;
          end if;


        -- Envia o stop bit, stop bit = 1
        when s_TX_Stop_Bit =>
          o_TX_Serial <= '1';

          -- Espera g_CLKS_POR_BIT - 1 ciclos de clock para finalizar o stop bit
          if r_Clk_Count < g_CLKS_POR_BIT - 1 then
            r_Clk_Count <= r_Clk_Count + 1;
            r_SM_Main   <= s_TX_Stop_Bit;
          else
            r_TX_Done   <= '1';
            r_Clk_Count <= 0;
            r_SM_Main   <= s_Cleanup;
          end if;


        -- Espera 1 ciclo de clock
        when s_Cleanup =>
          r_TX_Done   <= '1';
			 o_TX_Active <= '0';
          r_SM_Main   <= s_Idle;


        when others =>
          r_SM_Main <= s_Idle;

      end case;
    end if;
  end process p_UART_TX;

  o_TX_Done <= r_TX_Done;

end RLAB;