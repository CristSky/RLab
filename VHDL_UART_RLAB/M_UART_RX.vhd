----------------------------------------------------------------------------------
--
-- Module Name:    M_UART_RX - RLAB
-- Project Name: Laboratório Remoto
--
-- Description: - Este arquivo contém o receptor UART RX. Este receptor é capaz de
-- receber 8 bits de dados em série, um bit de início, um bit de parada,
-- e nenhum bit de paridade. Quando o recebimento estiver completo o_rx_dv será
-- elevado para um ciclo de clock.
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
use ieee.std_logic_1164.ALL;
use ieee.numeric_std.all;

entity M_UART_RX is
  generic (
    g_CLKS_POR_BIT : INTEGER -- Nota: Já Configurado no TOP Level
    );
  port (
    i_Clk       : in  std_logic;
    i_RX_Serial : in  std_logic;
    o_RX_DV     : out std_logic;
    o_RX_Byte   : out std_logic_vector(7 downto 0)
    );
end M_UART_RX;


architecture RLAB of M_UART_RX is

  type t_SM_Main is (s_Idle, s_RX_Start_Bit, s_RX_Data_Bits,
                     s_RX_Stop_Bit, s_Cleanup);
  signal r_SM_Main : t_SM_Main := s_Idle;

  signal r_RX_Data_R : std_logic := '0';
  signal r_RX_Data   : std_logic := '0';

  signal r_Clk_Count : integer range 0 to g_CLKS_POR_BIT-1 := 0;
  signal r_Bit_Index : integer range 0 to 7 := 0;  -- 8 Bits Total
  signal r_RX_Byte   : std_logic_vector(7 downto 0) := (others => '0');
  signal r_RX_DV     : std_logic := '0';

begin

  -- Propósito: Duplo registrador de entrada.
  -- Isso permite que ele seja usado no UART RX Clock Domain.
  -- (Remove problemas causados pela metastabilidade)
  p_SAMPLE : process (i_Clk)
  begin
    if rising_edge(i_Clk) then
      r_RX_Data_R <= i_RX_Serial;
      r_RX_Data   <= r_RX_Data_R;
    end if;
  end process p_SAMPLE;


  -- Contrala a máquina de estados do RX
  p_UART_RX : process (i_Clk)
  begin
    if rising_edge(i_Clk) then

      case r_SM_Main is

        when s_Idle =>
          r_RX_DV     <= '0';
          r_Clk_Count <= 0;
          r_Bit_Index <= 0;

          if r_RX_Data = '0' then       -- Detecta o start bit
            r_SM_Main <= s_RX_Start_Bit;
          else
            r_SM_Main <= s_Idle;
          end if;


        -- Verifica o meio do bit de início para se certificar de que ainda é baixo
        when s_RX_Start_Bit =>
          if r_Clk_Count = (g_CLKS_POR_BIT-1)/2 then
            if r_RX_Data = '0' then
              r_Clk_Count <= 0;  -- reseta o contador quando encontrar o meio
              r_SM_Main   <= s_RX_Data_Bits;
            else
              r_SM_Main   <= s_Idle;
            end if;
          else
            r_Clk_Count <= r_Clk_Count + 1;
            r_SM_Main   <= s_RX_Start_Bit;
          end if;


        -- Espera g_CLKS_POR_BIT-1 ciclos de clock para uma amostra da entrada serial
        when s_RX_Data_Bits =>
          if r_Clk_Count < g_CLKS_POR_BIT-1 then
            r_Clk_Count <= r_Clk_Count + 1;
            r_SM_Main   <= s_RX_Data_Bits;
          else
            r_Clk_Count            <= 0;
            r_RX_Byte(r_Bit_Index) <= r_RX_Data;

            -- verifica se já foi enviado todos os bits
            if r_Bit_Index < 7 then
              r_Bit_Index <= r_Bit_Index + 1;
              r_SM_Main   <= s_RX_Data_Bits;
            else
              r_Bit_Index <= 0;
              r_SM_Main   <= s_RX_Stop_Bit;
            end if;
          end if;


        -- Recebe o stop bit.  Stop bit = 1
        when s_RX_Stop_Bit =>
          -- Espera g_CLKS_POR_BIT-1 ciclos de clock para finalizar o stop bit
          if r_Clk_Count < g_CLKS_POR_BIT-1 then
            r_Clk_Count <= r_Clk_Count + 1;
            r_SM_Main   <= s_RX_Stop_Bit;
          else
            r_RX_DV     <= '1';
            r_Clk_Count <= 0;
				r_SM_Main   <= s_Cleanup;
          end if;

        -- Aguarda um ciclo de clock no s_Cleanup
        when s_Cleanup =>
          r_SM_Main <= s_Idle;
          r_RX_DV   <= '0';


        when others =>
          r_SM_Main <= s_Idle;

      end case;
    end if;
  end process p_UART_RX;

  o_RX_DV   <= r_RX_DV;
  o_RX_Byte <= r_RX_Byte;

end RLAB;